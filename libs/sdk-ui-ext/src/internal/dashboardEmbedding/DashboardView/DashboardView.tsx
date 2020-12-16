// (C) 2020 GoodData Corporation
import React, { useCallback, useEffect, useMemo } from "react";
import flatMap from "lodash/flatMap";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
import { ThemeProvider, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { useDashboard } from "../hooks/useDashboard";
import { useDashboardAlerts } from "../hooks/useDashboardAlerts";
import { IDashboardViewConfig, IDashboardViewProps } from "./types";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider";
import { useUserWorkspaceSettings } from "../hooks/useUserWorkspaceSettings";
import { useColorPalette } from "../hooks/useColorPalette";
import { DashboardLayoutObtainer } from "./DashboardLayoutObtainer";
import { DashboardViewConfigProvider } from "./DashboardViewConfigContext";
import { UserWorkspaceSettingsProvider } from "./UserWorkspaceSettingsContext";
import { ColorPaletteProvider } from "./ColorPaletteContext";
import { defaultThemeModifier } from "./defaultThemeModifier";
import { ScheduledMailDialog } from "../ScheduledMail/ScheduledMailDialog/ScheduledMailDialog";
import { useCatalog } from "../hooks/useCatalog";
import {
    ICatalogAttribute,
    ICatalogDateAttribute,
    IWorkspaceCatalogFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import { AttributesWithDrillDownProvider } from "./AttributesWithDrillDownContext";
import { IWorkspaceCatalog } from "@gooddata/sdk-backend-spi";

const catalogOptions: Partial<IWorkspaceCatalogFactoryOptions> = {
    types: ["attribute", "dateDataset"],
};

export const DashboardView: React.FC<IDashboardViewProps> = ({
    dashboard,
    filters,
    theme,
    disableThemeLoading = false,
    themeModifier = defaultThemeModifier,
    backend,
    workspace,
    onDrill,
    drillableItems,
    onError,
    onDashboardLoaded,
    config,
    isScheduledMailDialogVisible,
    applyFiltersToScheduledMail = true,
    onScheduledMailDialogCancel,
    onScheduledMailDialogSubmit,
    onScheduledMailSubmitError,
    onScheduledMailSubmitSuccess,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
}) => {
    const { error: dashboardError, result: dashboardData, status: dashboardStatus } = useDashboard({
        dashboard,
        backend,
        workspace,
    });

    const { error: alertsError, result: alertsData, status: alertsStatus } = useDashboardAlerts({
        dashboard,
        backend,
        workspace,
    });

    const {
        error: userWorkspaceSettingsError,
        result: userWorkspaceSettings,
        status: userWorkspaceSettingsStatus,
    } = useUserWorkspaceSettings({
        backend,
        workspace,
    });

    const { error: colorPaletteError, result: colorPalette, status: colorPaletteStatus } = useColorPalette({
        backend,
        workspace,
    });

    const { error: catalogError, result: catalog, status: catalogStatus } = useCatalog({
        catalogOptions,
        backend,
        workspace,
    });

    const handleDashboardLoaded = useCallback(() => {
        onDashboardLoaded?.({
            alerts: alertsData,
            dashboard: dashboardData,
        });
    }, [onDashboardLoaded, alertsData, dashboardData]);

    const error =
        dashboardError ?? alertsError ?? userWorkspaceSettingsError ?? colorPaletteError ?? catalogError;

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [onError, error]);

    const effectiveLocale = config?.locale ?? userWorkspaceSettings.locale;
    const effectiveConfig = useMemo<IDashboardViewConfig | undefined>(() => {
        if (!config && !userWorkspaceSettings) {
            return undefined;
        }

        return {
            mapboxToken: config?.mapboxToken,
            separators: config?.separators ?? userWorkspaceSettings?.separators,
            disableKpiDrillUnderline: userWorkspaceSettings?.disableKpiDashboardHeadlineUnderline,
        };
    }, [config, userWorkspaceSettings]);

    const statuses = [
        dashboardStatus,
        alertsStatus,
        userWorkspaceSettingsStatus,
        colorPaletteStatus,
        catalogStatus,
    ];

    if (statuses.includes("loading") || statuses.includes("pending")) {
        return <LoadingComponent />;
    }

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    let dashboardRender = (
        <DashboardViewConfigProvider config={effectiveConfig}>
            <UserWorkspaceSettingsProvider settings={userWorkspaceSettings}>
                <ColorPaletteProvider palette={colorPalette}>
                    <AttributesWithDrillDownProvider attributes={getAttributesWithDrillDown(catalog)}>
                        {isScheduledMailDialogVisible && (
                            <ScheduledMailDialog
                                backend={backend}
                                workspace={workspace}
                                locale={effectiveLocale}
                                dashboard={dashboard}
                                filters={applyFiltersToScheduledMail ? filters : undefined}
                                onSubmit={onScheduledMailDialogSubmit}
                                onSubmitSuccess={onScheduledMailSubmitSuccess}
                                onSubmitError={onScheduledMailSubmitError}
                                onCancel={onScheduledMailDialogCancel}
                                onError={onError}
                            />
                        )}
                        <DashboardLayoutObtainer
                            backend={backend}
                            workspace={workspace}
                            dashboard={dashboardData}
                            alerts={alertsData}
                            filters={filters}
                            filterContext={dashboardData.filterContext}
                            onDrill={onDrill}
                            drillableItems={drillableItems}
                            ErrorComponent={ErrorComponent}
                            LoadingComponent={LoadingComponent}
                            onDashboardLoaded={handleDashboardLoaded}
                            className="gd-dashboards-root"
                        />
                    </AttributesWithDrillDownProvider>
                </ColorPaletteProvider>
            </UserWorkspaceSettingsProvider>
        </DashboardViewConfigProvider>
    );

    if (!hasThemeProvider && !disableThemeLoading) {
        dashboardRender = (
            <ThemeProvider theme={theme} backend={backend} workspace={workspace} modifier={themeModifier}>
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return <InternalIntlWrapper locale={effectiveLocale}>{dashboardRender}</InternalIntlWrapper>;
};

function getAttributesWithDrillDown(
    catalog: IWorkspaceCatalog,
): Array<ICatalogAttribute | ICatalogDateAttribute> {
    const attributesWithDrillDown = catalog.attributes().filter((attr) => attr.attribute.drillDownStep);
    const dateAttributesWithDrillDown = flatMap(catalog.dateDatasets(), (dd) => dd.dateAttributes).filter(
        (attr) => attr.attribute.drillDownStep,
    );
    return [...attributesWithDrillDown, ...dateAttributesWithDrillDown];
}
