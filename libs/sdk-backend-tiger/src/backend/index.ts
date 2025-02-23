// (C) 2019-2021 GoodData Corporation
import { AxiosInstance } from "axios";
import invariant from "ts-invariant";
import {
    IAnalyticalBackendConfig,
    IBackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IAuthenticatedPrincipal,
    IWorkspacesQueryFactory,
    IUserService,
    ErrorConverter,
    NotAuthenticated,
    IAuthenticationContext,
    isNotAuthenticated,
    IOrganization,
    IOrganizations,
} from "@gooddata/sdk-backend-spi";
import { newAxios, tigerClientFactory, ITigerClient } from "@gooddata/api-client-tiger";
import isEmpty from "lodash/isEmpty";
import isString from "lodash/isString";

import { convertApiError } from "../utils/errorHandling";

import { TigerWorkspace } from "./workspace";
import { TigerWorkspaceQueryFactory } from "./workspaces";
import { TigerUserService } from "./user";
import {
    AuthProviderCallGuard,
    AuthenticatedAsyncCall,
    IAuthenticatedAsyncCallContext,
    TelemetryData,
    AnonymousAuthProvider,
    IAuthProviderCallGuard,
} from "@gooddata/sdk-backend-base";
import { DateFormatter } from "../convertors/fromBackend/dateFormatting/types";
import { createDefaultDateFormatter } from "../convertors/fromBackend/dateFormatting/defaultDateFormatter";
import { TigerOrganization, TigerOrganizations } from "./organization";

const CAPABILITIES: IBackendCapabilities = {
    canCalculateGrandTotals: true,
    canCalculateSubTotals: false,
    canCalculateNativeTotals: false,
    canCalculateTotals: false,
    canExportCsv: false,
    canExportXlsx: false,
    canSortData: false,
    canTransformExistingResult: false,
    maxDimensions: 2,
    supportsElementUris: false,
    supportsObjectUris: false,
    supportsCsvUploader: false,
    supportsRankingFilter: true,
    supportsElementsQueryParentFiltering: false,
    supportsKpiWidget: false,
};

/**
 * Client-specific configuration for the tiger backend allows to specify additional telemetry information.
 *
 * @public
 */
export type TigerBackendConfig = {
    /**
     * Name of frontend package, this will be recorded by backend as initiator of HTTP requests.
     */
    packageName?: string;

    /**
     * Version of the frontend package, this will be recorded by backend as initiator of HTTP requests.
     */
    packageVersion?: string;

    /**
     * Function used to format date values for a given granularity. It is given a parsed Date value and an appropriate granularity.
     * If not specified, a default date formatted will be used.
     */
    dateFormatter?: DateFormatter;
};

/**
 * An implementation of analytical backend for GoodData CloudNative (codename tiger).
 */
export class TigerBackend implements IAnalyticalBackend {
    public readonly capabilities: IBackendCapabilities = CAPABILITIES;
    public readonly config: IAnalyticalBackendConfig;

    private readonly telemetry: TelemetryData;
    private readonly implConfig: TigerBackendConfig;
    private readonly client: ITigerClient;
    private readonly authProvider: IAuthProviderCallGuard;
    private readonly dateFormatter: DateFormatter;

    constructor(
        config: IAnalyticalBackendConfig = {},
        implConfig: TigerBackendConfig = {},
        telemetry: TelemetryData = {},
        authProvider?: IAuthProviderCallGuard,
    ) {
        this.config = config;
        this.implConfig = implConfig;
        this.telemetry = telemetry;
        this.authProvider = authProvider || new AnonymousAuthProvider();
        this.dateFormatter = implConfig.dateFormatter ?? createDefaultDateFormatter();

        const axios = createAxios(this.config, this.implConfig, this.telemetry);
        this.client = tigerClientFactory(axios);

        this.authProvider.initializeClient?.(this.client);
    }

    public onHostname(hostname: string): IAnalyticalBackend {
        return new TigerBackend({ ...this.config, hostname }, this.implConfig, this.telemetry);
    }

    public withTelemetry(componentName: string, props: object): IAnalyticalBackend {
        return new TigerBackend(
            this.config,
            this.implConfig,
            { componentName, props: Object.keys(props) },
            this.authProvider,
        );
    }

    public withAuthentication(provider: IAuthenticationProvider): IAnalyticalBackend {
        const guardedAuthProvider = new AuthProviderCallGuard(provider);

        return new TigerBackend(this.config, this.implConfig, this.telemetry, guardedAuthProvider);
    }

    public deauthenticate(): Promise<void> {
        if (!this.authProvider) {
            throw new NotAuthenticated("Backend is not set up with authentication provider.");
        }
        return this.authProvider.deauthenticate(this.getAuthenticationContext());
    }

    public organization(organizationId: string): IOrganization {
        return new TigerOrganization(this.authApiCall, organizationId);
    }

    public organizations(): IOrganizations {
        return new TigerOrganizations(this.authApiCall);
    }

    public currentUser(): IUserService {
        return new TigerUserService(this.authApiCall);
    }

    public workspace(id: string): IAnalyticalWorkspace {
        invariant(isString(id), `Invalid workspaceId, expected a string, got: ${id}`);
        return new TigerWorkspace(this.authApiCall, id, this.dateFormatter);
    }

    public workspaces(): IWorkspacesQueryFactory {
        return new TigerWorkspaceQueryFactory(this.authApiCall, this.dateFormatter);
    }

    public isAuthenticated = (): Promise<IAuthenticatedPrincipal | null> => {
        return new Promise((resolve, reject) => {
            this.authProvider
                .getCurrentPrincipal({ client: this.client, backend: this })
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    if (isNotAuthenticatedResponse(err)) {
                        resolve(null);
                    }

                    reject(err);
                });
        });
    };

    public authenticate = (force: boolean): Promise<IAuthenticatedPrincipal> => {
        if (!force) {
            return this.authApiCall(async (client) => {
                const principal = await this.authProvider.getCurrentPrincipal({ client, backend: this });
                invariant(principal, "Principal must be defined");
                return principal!;
            });
        }

        return this.triggerAuthentication(true).catch((err) => {
            if (isNotAuthenticated(err)) {
                this.authProvider.onNotAuthenticated?.({ client: this.client, backend: this }, err);
            }

            throw err;
        });
    };

    /**
     * Perform API call that requires authentication. The call will be decorated with error handling
     * such that not authenticated errors will trigger authentication flow AND other errors will be
     * converted using the provided converter and throw.
     *
     * @param call - a call which requires an authenticated session
     * @param errorConverter - converter from rest client errors to analytical backend errors
     */
    private authApiCall = async <T>(
        call: AuthenticatedAsyncCall<ITigerClient, T>,
        errorConverter: ErrorConverter = convertApiError,
    ): Promise<T> => {
        return call(this.client, await this.getAsyncCallContext())
            .catch((err) => {
                if (!isNotAuthenticatedResponse(err)) {
                    throw errorConverter(err);
                }

                return this.triggerAuthentication()
                    .then(async (_) => {
                        return call(this.client, await this.getAsyncCallContext()).catch((e) => {
                            throw errorConverter(e);
                        });
                    })
                    .catch((err2) => {
                        throw errorConverter(err2);
                    });
            })
            .catch((err) => {
                if (isNotAuthenticated(err)) {
                    this.authProvider.onNotAuthenticated?.({ client: this.client, backend: this }, err);
                }

                throw err;
            });
    };

    private getAuthenticationContext = (): IAuthenticationContext => {
        return { client: this.client, backend: this };
    };

    private getAsyncCallContext = async (): Promise<IAuthenticatedAsyncCallContext> => {
        const getPrincipal = async (): Promise<IAuthenticatedPrincipal> => {
            if (!this.authProvider) {
                throw new NotAuthenticated("Cannot obtain principal without an authProvider.");
            }

            const principal = await this.authProvider.getCurrentPrincipal({
                client: this.client,
                backend: this,
            });
            if (principal) {
                return principal;
            }

            return this.authProvider.authenticate(this.getAuthenticationContext());
        };

        return {
            getPrincipal,
        };
    };

    private triggerAuthentication = (reset = false): Promise<IAuthenticatedPrincipal> => {
        if (!this.authProvider) {
            return Promise.reject(
                new NotAuthenticated("Backend is not set up with authentication provider."),
            );
        }

        if (reset) {
            this.authProvider.reset();
        }

        return this.authProvider.authenticate({ client: this.client, backend: this });
    };
}

function createAxios(
    config: IAnalyticalBackendConfig,
    implConfig: TigerBackendConfig,
    telemetry: TelemetryData,
): AxiosInstance {
    const baseUrl = config.hostname ? config.hostname : undefined;
    const headers = createHeaders(implConfig, telemetry);

    return newAxios(baseUrl, headers);
}

function createHeaders(implConfig: TigerBackendConfig, telemetry: TelemetryData): { [name: string]: string } {
    const headers: { [name: string]: string } = {};

    if (telemetry.componentName) {
        headers["X-GDC-JS-SDK-COMP"] = telemetry.componentName;
    }

    if (telemetry.props && !isEmpty(telemetry.props)) {
        headers["X-GDC-JS-SDK-COMP-PROPS"] = telemetry.props.join(",");
    }

    if (implConfig.packageName && implConfig.packageVersion) {
        headers["X-GDC-JS-PACKAGE"] = implConfig.packageName;
        headers["X-GDC-JS-PACKAGE-VERSION"] = implConfig.packageVersion;
    }

    return headers;
}

function isNotAuthenticatedResponse(err: any): boolean {
    return err?.response?.status === 401;
}
