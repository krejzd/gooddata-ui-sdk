// (C) 2019-2021 GoodData Corporation

import { AxiosPromise } from "axios";
import flatMap from "lodash/flatMap";
import merge from "lodash/merge";
import uniqBy from "lodash/uniqBy";
import { ITigerClient } from "./client";
import { jsonApiHeaders } from "./constants";
import {
    JsonApiACLList,
    JsonApiOrganizationList,
    JsonApiUserList,
    JsonApiUserGroupList,
    JsonApiWorkspaceList,
} from "./generated/metadata-json-api";

const DefaultPageSize = 250;
const DefaultOptions = {
    headers: jsonApiHeaders,
    query: {
        size: DefaultPageSize,
    },
};

function createOptionsForPage(
    page: number,
    options: OrganizationGetEntitiesOptions,
): OrganizationGetEntitiesOptions {
    return merge({}, DefaultOptions, options, { query: { page } });
}

/**
 * Common parameters for all API client getEntities* parameters.
 *
 * @internal
 */
export type OrganizationGetEntitiesOptions = {
    headers?: object;
    query?: {
        page?: number;
        size?: number;
        include?: any;
        sort?: any;
        tags?: any;
    };
};

/**
 * All possible responses of API client getEntities* functions.
 *
 * @internal
 */
export type OrganizationGetEntitiesResult =
    | JsonApiACLList
    | JsonApiOrganizationList
    | JsonApiUserList
    | JsonApiUserGroupList
    | JsonApiWorkspaceList;

/**
 * All API client getEntities* functions follow this signature.
 *
 * @internal
 */
export type OrganizationGetEntitiesFn<T extends OrganizationGetEntitiesResult, P> = (
    params: P,
    options: OrganizationGetEntitiesOptions,
) => AxiosPromise<T>;

/**
 * Tiger organization utility functions
 *
 * @internal
 */
export class OrganizationUtilities {
    /**
     * Given a function to get a paged list of metadata entities, API call parameters and options, this function will
     * retrieve all pages from the metadata.
     *
     * The parameters are passed to the function as is. The options will be used as a 'template'. If the options specify
     * page `size`, it will be retained and used for paging. Otherwise the size will be set to a default value (250). The
     * `page` number will be added dynamically upon each page request.
     *
     * @param client - API client to use, this is required so that function can correctly bind 'this' for
     *  the entitiesGet function
     * @param entitiesGet - function to get pages list of entities
     * @param params - parameters accepted by the function
     * @param options - options accepted by the function
     * @internal
     */
    public static getAllPagesOf = async <T extends OrganizationGetEntitiesResult, P>(
        client: ITigerClient,
        entitiesGet: OrganizationGetEntitiesFn<T, P>,
        params: P,
        options: OrganizationGetEntitiesOptions = {},
    ): Promise<T[]> => {
        const boundGet = entitiesGet.bind(client.organizationObjects);
        const results: T[] = [];
        const pageSize = options.query?.size ?? DefaultPageSize;
        let reachedEnd = false;
        let nextPage: number = 0;

        while (!reachedEnd) {
            const optionsToUse = createOptionsForPage(nextPage, options);
            const result = await boundGet(params, optionsToUse);

            results.push(result.data);

            if (result.data.data.length < pageSize) {
                reachedEnd = true;
            } else {
                nextPage += 1;
            }
        }

        return results;
    };

    /**
     * This function merges multiple pages containing metadata entities into a single page. The entity data from different
     * pages are concatenated. The side-loaded entities are concatenated and their uniqueness is ensured so that same
     * entity sideloaded on multiple pages only appears once.
     *
     * The merges result WILL NOT contain any links section.
     *
     * @param pages - pages to merge
     * @internal
     */
    public static mergeEntitiesResults<T extends OrganizationGetEntitiesResult>(pages: T[]): T {
        return {
            data: flatMap(pages, (page) => page.data) as any,
            included: uniqBy(
                flatMap(pages, (page) => page.included ?? []),
                (item: any) => `${item.id}_${item.type}`,
            ) as any,
        } as T;
    }
}
