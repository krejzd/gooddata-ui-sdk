// (C) 2007-2021 GoodData Corporation
import isPlainObject from "lodash/isPlainObject";
import get from "lodash/get";
import chunk from "lodash/chunk";
import flatten from "lodash/flatten";
import pick from "lodash/pick";
import pickBy from "lodash/pickBy";
import {
    GdcVisualizationObject,
    GdcMetadata,
    GdcMetadataObject,
    GdcProjectDashboard,
} from "@gooddata/api-model-bear";
import { getIn, handlePolling, queryString } from "./util";
import { ApiResponse, ApiResponseError, XhrModule } from "./xhr";
import {
    IGetObjectsByQueryOptions,
    IGetObjectUsingOptions,
    IGetObjectsByQueryWithPagingResponse,
} from "./interfaces";
import { stringify } from "./utils/queryString";

export interface IUriIdentifierPair {
    uri: string;
    identifier: string;
}

/**
 * Functions for working with metadata objects
 *
 * @class metadata
 * @module metadata
 */
export class MetadataModule {
    constructor(private xhr: XhrModule) {}

    /**
     * Get default display form value of provided atrribute element uri
     * @param attributeElementUri string
     */
    public async getAttributeElementDefaultDisplayFormValue(
        attributeElementUri: string,
    ): Promise<GdcMetadata.IAttributeElement | undefined> {
        const uriChunks = attributeElementUri.match(/(.+)\/elements\?id=(.*)/);
        if (!uriChunks) {
            throw new Error("Provide valid attribute element uri");
        }
        const attributeUri = uriChunks[1];
        const elementId = uriChunks[2];
        const defaultDisplayForm = await this.getAttributeDefaultDisplayForm(attributeUri);
        if (!defaultDisplayForm) {
            throw new Error("Attribute of the provided element has no default display form!");
        }
        const defaultDisplayFormUri = defaultDisplayForm.meta.uri;
        const defaultDisplayFormElementValue = await this.xhr.getParsed<GdcMetadata.IWrappedAttributeElements>(
            `${defaultDisplayFormUri}/elements?id=${elementId}`,
        );

        const firstElement = defaultDisplayFormElementValue.attributeElements.elements[0];
        return firstElement;
    }

    /**
     * Get default display form of provided attribute uri
     * @param attributeUri string
     */
    public async getAttributeDefaultDisplayForm(
        attributeUri: string,
    ): Promise<GdcMetadata.IAttributeDisplayForm> {
        const object = await this.xhr.getParsed<GdcMetadataObject.WrappedObject>(attributeUri);
        if (!GdcMetadata.isWrappedAttribute(object)) {
            throw new Error("Provided uri is not attribute uri!");
        }

        return (
            object.attribute.content.displayForms.find((displayForm) => displayForm.content.default === 1) ||
            object.attribute.content.displayForms[0]
        );
    }

    /**
     * Get metadata object by provided identifier
     * @param projectId string
     * @param identifier string
     */
    public async getObjectByIdentifier<
        T extends GdcMetadataObject.WrappedObject = GdcMetadataObject.WrappedObject
    >(projectId: string, identifier: string): Promise<T> {
        const uri = await this.getObjectUri(projectId, identifier);
        return this.xhr.getParsed<T>(uri);
    }

    /**
     * Get metadata objects by provided identifiers
     * @param projectId string
     * @param identifiers string[]
     */
    public async getObjectsByIdentifiers<
        T extends GdcMetadataObject.WrappedObject = GdcMetadataObject.WrappedObject
    >(projectId: string, identifiers: string[]): Promise<T[]> {
        const uriIdentifierPairs = await this.getUrisFromIdentifiers(projectId, identifiers);
        const uris = uriIdentifierPairs.map((pair) => pair.uri);
        const objects: T[] = await this.getObjects(projectId, uris);
        return objects;
    }

    /**
     * Load all objects with given uris
     * (use bulk loading instead of getting objects one by one)
     *
     * @method getObjects
     * @param {String} projectId id of the project
     * @param {Array} objectUris array of uris for objects to be loaded
     * @return {Array} array of loaded elements
     */
    public getObjects<T extends GdcMetadataObject.WrappedObject = GdcMetadataObject.WrappedObject>(
        projectId: string,
        objectUris: string[],
    ): Promise<T[]> {
        const LIMIT = 50;
        const uri = `/gdc/md/${projectId}/objects/get`;

        const objectsUrisChunks = chunk(objectUris, LIMIT);

        const promises = objectsUrisChunks.map((objectUrisChunk) => {
            const body = {
                get: {
                    items: objectUrisChunk,
                },
            };

            return this.xhr
                .post(uri, { body })
                .then((r: ApiResponse) => {
                    if (!r.response.ok) {
                        throw new ApiResponseError(r.response.statusText, r.response, r.responseBody);
                    }

                    return r.getData();
                })
                .then((result: any) =>
                    get(result, ["objects", "items"]).map((item: any) => {
                        if (item.visualizationObject) {
                            return {
                                visualizationObject: item.visualizationObject,
                            };
                        }
                        return item;
                    }),
                );
        });

        return Promise.all(promises).then(flatten);
    }

    /**
     * Loads all objects by query (fetches all pages, one by one)
     *
     * @method getObjectsByQuery
     * @param {String} projectId id of the project
     * @param {Object} options (see https://developer.gooddata.com/api endpoint: /gdc/md/{project_id}/objects/query)
     *        - category {String} for example 'dataSets' or 'projectDashboard'
     *        - mode {String} 'enriched' or 'raw'
     *        - author {String} the URI of the author of the metadata objects
     *        - limit {number} default is 50 (also maximum)
     *        - deprecated {boolean} show also deprecated objects
     * @return {Promise<Array>} array of returned objects
     */
    public getObjectsByQuery<T extends GdcMetadataObject.WrappedObject = GdcMetadataObject.WrappedObject>(
        projectId: string,
        options: IGetObjectsByQueryOptions,
    ): Promise<T[]> {
        const getOnePage = (uri: string, items: any[] = []): Promise<any> => {
            return this.xhr
                .get(uri)
                .then((r: ApiResponse) => r.getData())
                .then(({ objects }: any) => {
                    items.push(...objects.items);
                    const nextUri = objects.paging.next;
                    return nextUri ? getOnePage(nextUri, items) : items;
                });
        };

        const deprecated = options.deprecated ? { deprecated: 1 } : {};
        const uri = `/gdc/md/${projectId}/objects/query`;
        const query = pick({ limit: 50, ...options, ...deprecated }, [
            "category",
            "mode",
            "author",
            "limit",
            "deprecated",
        ]);
        return getOnePage(uri + queryString(query));
    }

    /**
     * Loads all objects by query with paging
     *
     * @method getObjectsByQueryWithPaging
     * @param {String} projectId id of the project
     * @param {Object} options (see https://developer.gooddata.com/api endpoint: /gdc/md/{project_id}/objects/query)
     *        - category {String} for example 'dataSets' or 'projectDashboard'
     *        - mode {String} 'enriched' or 'raw'
     *        - author {String} the URI of the author of the metadata objects
     *        - limit {number} default is 50 (also maximum)
     *        - deprecated {boolean} show also deprecated objects
     *        - orderBy {id|title|updated} order the results by id, title or the last updated (newest first)
     *        - getTotalCount {boolean} include total count of items in the paging object
     * @return {Promise<Array>} array of returned objects
     */
    public getObjectsByQueryWithPaging<T = any>(
        projectId: string,
        options: IGetObjectsByQueryOptions,
    ): Promise<IGetObjectsByQueryWithPagingResponse<T>> {
        const getTotalCount = options && options.getTotalCount ? 1 : 0;
        const uri = `/gdc/md/${projectId}/objects/query?${stringify({ ...options, getTotalCount })}`;
        return this.xhr
            .get(uri)
            .then((r: ApiResponse) => r.getData())
            .then(({ objects }: any) => objects);
    }

    /**
     * Get MD objects from using2 resource. Include only objects of given types
     * and take care about fetching only nearest objects if requested.
     *
     * @method getObjectUsing
     * @param {String} projectId id of the project
     * @param {String} uri uri of the object for which dependencies are to be found
     * @param {Object} options objects with options:
     *        - types {Array} array of strings with object types to be included
     *        - nearest {Boolean} whether to include only nearest dependencies
     * @return {Promise} promise promise once resolved returns an array of
     *         entries returned by using2 resource
     */
    public getObjectUsing(
        projectId: string,
        uri: string,
        options: IGetObjectUsingOptions = {},
    ): Promise<GdcMetadata.IObjectLink[]> {
        const { types = [], nearest = false } = options;
        const resourceUri = `/gdc/md/${projectId}/using2`;

        const body = {
            inUse: {
                uri,
                types,
                nearest: nearest ? 1 : 0,
            },
        };

        return this.xhr
            .post(resourceUri, { body })
            .then((r: ApiResponse) => {
                if (!r.response.ok) {
                    throw new ApiResponseError(r.response.statusText, r.response, r.getData());
                }

                return r.getData();
            })
            .then((result) => result.entries);
    }

    /**
     * Get MD objects from using2 resource. Include only objects of given types
     * and take care about fetching only nearest objects if requested.
     *
     * @method getObjectUsingMany
     * @param {String} projectId id of the project
     * @param {Array} uris uris of objects for which dependencies are to be found
     * @param {Object} options objects with options:
     *        - types {Array} array of strings with object types to be included
     *        - nearest {Boolean} whether to include only nearest dependencies
     * @return {Promise} promise promise once resolved returns an array of
     *         entries returned by using2 resource
     */
    public getObjectUsingMany(
        projectId: string,
        uris: string[],
        options: IGetObjectUsingOptions = {},
    ): Promise<GdcMetadata.IGetObjectUsingManyEntry[]> {
        const { types = [], nearest = false } = options;
        const resourceUri = `/gdc/md/${projectId}/using2`;

        const body = {
            inUseMany: {
                uris,
                types,
                nearest: nearest ? 1 : 0,
            },
        };

        return this.xhr
            .post(resourceUri, { body })
            .then((r: ApiResponse) => {
                if (!r.response.ok) {
                    throw new ApiResponseError(r.response.statusText, r.response, r.getData());
                }

                return r.getData();
            })
            .then((result: any) => result.useMany);
    }

    /**
     * Get MD objects from usedby2 resource. Include only objects of given types
     * and take care about fetching only nearest objects if requested.
     *
     * @method getObjectUsedBy
     * @param {String} projectId id of the project
     * @param {String} uri uri of the object for which dependencies are to be found
     * @param {Object} options objects with options:
     *        - types {Array} array of strings with object types to be included
     *        - nearest {Boolean} whether to include only nearest dependencies (default is false)
     * @return {Promise} promise promise once resolved returns an array of
     *         entries returned by usedby2 resource
     */
    public getObjectUsedBy(
        projectId: string,
        uri: string,
        options: {
            types: GdcMetadata.ObjectCategory[];
            nearest: boolean;
        },
    ): Promise<GdcMetadata.IObjectLink[]> {
        const { nearest = false, types = [] } = options;
        const body = {
            inUse: {
                nearest: nearest ? 1 : 0,
                uri,
                types,
            },
        };

        return this.xhr
            .postParsed<GdcMetadata.IGetObjectUsedBy>(`/gdc/md/${projectId}/usedby2`, { body })
            .then((result) => result.entries);
    }

    /**
     * Get MD objects from usedby2 resource. Include only objects of given types
     * and take care about fetching only nearest objects if requested.
     *
     * @method getObjectsUsedByMany
     * @param {String} projectId id of the project
     * @param {Array} uris uris of objects for which dependencies are to be found
     * @param {Object} options objects with options:
     *        - types {Array} array of strings with object types to be included
     *        - nearest {Boolean} whether to include only nearest dependencies (default is false)
     * @return {Promise} promise promise once resolved returns an array of
     *         entries returned by usedby2 resource
     */
    public getObjectsUsedByMany(
        projectId: string,
        uris: string[],
        options: {
            types: GdcMetadata.ObjectCategory[];
            nearest: boolean;
        },
    ): Promise<GdcMetadata.IGetObjectsUsedByManyEntry[]> {
        const uri = `/gdc/md/${projectId}/usedby2`;
        const { nearest = false, types = [] } = options;
        const body = {
            inUseMany: {
                nearest: nearest ? 1 : 0,
                uris,
                types,
            },
        };

        return this.xhr
            .postParsed<{
                useMany: GdcMetadata.IGetObjectsUsedByManyEntry[];
            }>(uri, { body })
            .then((result) => result.useMany);
    }

    /**
     * Returns all visualizationObjects metadata in a project specified by projectId param
     *
     * @method getVisualizations
     * @param {string} projectId Project identifier
     * @return {Array} An array of visualization objects metadata
     */
    public getVisualizations(projectId: string): Promise<any> {
        return this.xhr
            .get(`/gdc/md/${projectId}/query/visualizationobjects`)
            .then((apiResponse: ApiResponse) =>
                apiResponse.response.ok ? apiResponse.getData() : apiResponse.response,
            )
            .then(getIn("query.entries"));
    }

    /**
     * Returns all attributes in a project specified by projectId param
     *
     * @method getAttributes
     * @param {string} projectId Project identifier
     * @return {Array} An array of attribute objects
     */
    public getAttributes(projectId: string): Promise<any> {
        return this.xhr
            .get(`/gdc/md/${projectId}/query/attributes`)
            .then((apiResponse: ApiResponse) =>
                apiResponse.response.ok ? apiResponse.getData() : apiResponse.response,
            )
            .then(getIn("query.entries"));
    }

    /**
     * Returns all dimensions in a project specified by projectId param
     *
     * @method getDimensions
     * @param {string} projectId Project identifier
     * @return {Array} An array of dimension objects
     * @see getFolders
     */
    public getDimensions(projectId: string): Promise<any> {
        return this.xhr
            .get(`/gdc/md/${projectId}/query/dimensions`)
            .then((apiResponse: ApiResponse) =>
                apiResponse.response.ok ? apiResponse.getData() : apiResponse.response,
            )
            .then(getIn("query.entries"));
    }

    /**
     * Returns project folders. Folders can be of specific types and you can specify
     * the type you need by passing and optional `type` parameter
     *
     * @method getFolders
     * @param {String} projectId - Project identifier
     * @param {String} type - Optional, possible values are `metric`, `fact`, `attribute`
     * @return {Array} An array of dimension objects
     */
    public getFolders(projectId: string, type: string): Promise<any> {
        // TODO enum?
        const getFolderEntries = (pId: string, t: string) => {
            const typeURL = t ? `?type=${t}` : "";

            return this.xhr
                .get(`/gdc/md/${pId}/query/folders${typeURL}`)
                .then((r) => r.getData())
                .then(getIn("query.entries"));
        };

        switch (type) {
            case "fact":
            case "metric":
                return getFolderEntries(projectId, type);
            case "attribute":
                return this.getDimensions(projectId);
            default:
                return Promise.all([
                    getFolderEntries(projectId, "fact"),
                    getFolderEntries(projectId, "metric"),
                    this.getDimensions(projectId),
                ]).then(([fact, metric, attribute]) => {
                    return { fact, metric, attribute };
                });
        }
    }

    /**
     * Returns all facts in a project specified by the given projectId
     *
     * @method getFacts
     * @param {string} projectId Project identifier
     * @return {Array} An array of fact objects
     */
    public getFacts(projectId: string): Promise<any> {
        return this.xhr
            .get(`/gdc/md/${projectId}/query/facts`)
            .then((apiResponse: ApiResponse) =>
                apiResponse.response.ok ? apiResponse.getData() : apiResponse.response,
            )
            .then(getIn("query.entries"));
    }

    /**
     * Returns all metrics in a project specified by the given projectId
     *
     * @method getMetrics
     * @param {string} projectId Project identifier
     * @return {Array} An array of metric objects
     */
    public getMetrics(projectId: string): Promise<any> {
        return this.xhr
            .get(`/gdc/md/${projectId}/query/metrics`)
            .then((apiResponse: ApiResponse) =>
                apiResponse.response.ok ? apiResponse.getData() : apiResponse.response,
            )
            .then(getIn("query.entries"));
    }

    /**
     * Returns all project dashboards (pixel perfect dashboards) in a project specified by the given projectId
     *
     * @method getProjectDashboards
     * @param {string} projectId Project identifier
     * @return {Array} An array of project dashboard objects
     */
    public getProjectDashboards(projectId: string): Promise<GdcProjectDashboard.IWrappedProjectDashboard[]> {
        return this.xhr
            .getParsed<{ query: { entries: GdcMetadata.IObjectLink[] } }>(
                `/gdc/md/${projectId}/query/projectdashboards`,
            )
            .then((dashboardsQuery) => {
                const dashboardLinks = dashboardsQuery.query.entries.map((dashboard) => dashboard.link);
                return this.getObjects<GdcProjectDashboard.IWrappedProjectDashboard>(
                    projectId,
                    dashboardLinks,
                );
            });
    }

    /**
     * Returns all analytical dashboards (kpi dashboards) in a project specified by the given projectId
     *
     * @method getAnalyticalDashboards
     * @param {string} projectId Project identifier
     * @return {Array} An array of analytical dashboard objects
     */
    public getAnalyticalDashboards(projectId: string): Promise<GdcMetadata.IObjectLink[]> {
        return this.xhr
            .getParsed<{ query: { entries: GdcMetadata.IObjectLink[] } }>(
                `/gdc/md/${projectId}/query/analyticaldashboard`,
            )
            .then((dashboardsQuery) => {
                return dashboardsQuery.query.entries;
            });
    }

    /**
     * Returns all metrics that are reachable (with respect to ldm of the project
     * specified by the given projectId) for given attributes
     *
     * @method getAvailableMetrics
     * @param {String} projectId - Project identifier
     * @param {Array} attrs - An array of attribute uris for which we want to get
     * available metrics
     * @return {Array} An array of reachable metrics for the given attrs
     * @see getAvailableAttributes
     * @see getAvailableFacts
     */
    public getAvailableMetrics(projectId: string, attrs: string[] = []): Promise<any> {
        return this.xhr
            .post(`/gdc/md/${projectId}/availablemetrics`, { body: attrs })
            .then((apiResponse: ApiResponse) =>
                apiResponse.response.ok ? apiResponse.getData() : apiResponse.response,
            )
            .then((data: any) => data.entries);
    }

    /**
     * Returns all attributes that are reachable (with respect to ldm of the project
     * specified by the given projectId) for given metrics (also called as drillCrossPath)
     *
     * @method getAvailableAttributes
     * @param {String} projectId - Project identifier
     * @param {Array} metrics - An array of metric uris for which we want to get
     * available attributes
     * @return {Array} An array of reachable attributes for the given metrics
     * @see getAvailableMetrics
     * @see getAvailableFacts
     */
    public getAvailableAttributes(projectId: string, metrics: string[] = []): Promise<any> {
        return this.xhr
            .post(`/gdc/md/${projectId}/drillcrosspaths`, { body: metrics })
            .then((apiResponse) => (apiResponse.response.ok ? apiResponse.getData() : apiResponse.response))
            .then((r: any) => r.drillcrosspath.links);
    }

    /**
     * Returns all attributes that are reachable (with respect to ldm of the project
     * specified by the given projectId) for given metrics (also called as drillCrossPath)
     *
     * @method getAvailableFacts
     * @param {String} projectId - Project identifier
     * @param {Array} items - An array of metric or attribute uris for which we want to get
     * available facts
     * @return {Array} An array of reachable facts for the given items
     * @see getAvailableAttributes
     * @see getAvailableMetrics
     */
    public getAvailableFacts(projectId: string, items: string[] = []): Promise<any> {
        return this.xhr
            .post(`/gdc/md/${projectId}/availablefacts`, { body: items })
            .then((r: ApiResponse) => (r.response.ok ? r.getData() : r.response))
            .then((r: any) => r.entries);
    }

    /**
     * Get details of a metadata object specified by its uri
     *
     * @method getObjectDetails
     * @param uri uri of the metadata object for which details are to be retrieved
     * @return {Object} object details
     */
    public getObjectDetails<T = any>(uri: string): Promise<T> {
        return this.xhr.get(uri).then((r: ApiResponse) => r.getData());
    }

    /**
     * Get folders with items.
     * Returns array of folders, each having a title and items property which is an array of
     * corresponding items. Each item is either a metric or attribute, keeping its original
     * verbose structure.
     *
     * @method getFoldersWithItems
     * @param {String} type type of folders to return
     * @return {Array} Array of folder object, each containing title and
     * corresponding items.
     */
    public getFoldersWithItems(projectId: string, type: string): Promise<any> {
        // fetch all folders of given type and process them
        return this.getFolders(projectId, type).then((folders) => {
            // Helper public to get details for each metric in the given
            // array of links to the metadata objects representing the metrics.
            // @return the array of promises
            const getMetricItemsDetails = (array: any[]) => {
                return Promise.all(array.map(this.getObjectDetails)).then((metricArgs) => {
                    return metricArgs.map((item: any) => item.metric);
                });
            };

            // helper mapBy function
            function mapBy(array: any[], key: string) {
                return array.map((item: any) => {
                    return item[key];
                });
            }

            // helper for sorting folder tree structure
            // sadly @returns void (sorting == mutating array in js)
            const sortFolderTree = (structure: any[]) => {
                structure.forEach((folder) => {
                    folder.items.sort((a: any, b: any) => {
                        if (a.meta.title < b.meta.title) {
                            return -1;
                        } else if (a.meta.title > b.meta.title) {
                            return 1;
                        }

                        return 0;
                    });
                });
                structure.sort((a, b) => {
                    if (a.title < b.title) {
                        return -1;
                    } else if (a.title > b.title) {
                        return 1;
                    }

                    return 0;
                });
            };

            const foldersLinks = mapBy(folders, "link");
            const foldersTitles = mapBy(folders, "title");

            // fetch details for each folder
            return Promise.all(foldersLinks.map(this.getObjectDetails)).then((folderDetails) => {
                // if attribute, just parse everything from what we've received
                // and resolve. For metrics, lookup again each metric to get its
                // identifier. If passing unsupported type, reject immediately.
                if (type === "attribute") {
                    // get all attributes, subtract what we have and add rest in unsorted folder
                    return this.getAttributes(projectId).then((attributes) => {
                        // get uris of attributes which are in some dimension folders
                        const attributesInFolders: any[] = [];
                        folderDetails.forEach((fd: any) => {
                            fd.dimension.content.attributes.forEach((attr: any) => {
                                attributesInFolders.push(attr.meta.uri);
                            });
                        });
                        // unsortedUris now contains uris of all attributes which aren't in a folder
                        const unsortedUris = attributes
                            .filter((item: any) => attributesInFolders.indexOf(item.link) === -1)
                            .map((item: any) => item.link);
                        // now get details of attributes in no folders
                        return Promise.all(unsortedUris.map(this.getObjectDetails)).then(
                            (unsortedAttributeArgs) => {
                                // TODO add map to r.json
                                // get unsorted attribute objects
                                const unsortedAttributes = unsortedAttributeArgs.map(
                                    (attr: any) => attr.attribute,
                                );
                                // create structure of folders with attributes
                                const structure = folderDetails.map((folderDetail: any) => {
                                    return {
                                        title: folderDetail.dimension.meta.title,
                                        items: folderDetail.dimension.content.attributes,
                                    };
                                });
                                // and append "Unsorted" folder with attributes to the structure
                                structure.push({
                                    title: "Unsorted",
                                    items: unsortedAttributes,
                                });
                                sortFolderTree(structure);

                                return structure;
                            },
                        );
                    });
                } else if (type === "metric") {
                    const entriesLinks = folderDetails.map((entry: any) =>
                        mapBy(entry.folder.content.entries, "link"),
                    );
                    // get all metrics, subtract what we have and add rest in unsorted folder
                    return this.getMetrics(projectId).then((metrics) => {
                        // get uris of metrics which are in some dimension folders
                        const metricsInFolders: string[] = [];
                        folderDetails.forEach((fd: any) => {
                            fd.folder.content.entries.forEach((metric: any) => {
                                metricsInFolders.push(metric.link);
                            });
                        });
                        // unsortedUris now contains uris of all metrics which aren't in a folder
                        const unsortedUris = metrics
                            .filter((item: any) => metricsInFolders.indexOf(item.link) === -1)
                            .map((item: any) => item.link);

                        // sadly order of parameters of concat matters! (we want unsorted last)
                        entriesLinks.push(unsortedUris);

                        // now get details of all metrics
                        return Promise.all(
                            entriesLinks.map((linkArray) => getMetricItemsDetails(linkArray)),
                        ).then((tree) => {
                            // TODO add map to r.json
                            // all promises resolved, i.e. details for each metric are available
                            const structure = tree.map((treeItems, idx) => {
                                // if idx is not in folders list than metric is in "Unsorted" folder
                                return {
                                    title: foldersTitles[idx] || "Unsorted",
                                    items: treeItems,
                                };
                            });
                            sortFolderTree(structure);
                            return structure;
                        });
                    });
                }

                return Promise.reject(null);
            });
        });
    }

    /**
     * Get identifier of a metadata object identified by its uri
     *
     * @method getObjectIdentifier
     * @param uri uri of the metadata object for which the identifier is to be retrieved
     * @return {String} object identifier
     */
    public getObjectIdentifier(uri: string): Promise<string> {
        function idFinder(obj: any) {
            // TODO
            if (obj.attribute) {
                return obj.attribute.content.displayForms[0].meta.identifier;
            } else if (obj.dimension) {
                return obj.dimension.content.attributes.content.displayForms[0].meta.identifier;
            } else if (obj.metric) {
                return obj.metric.meta.identifier;
            } else if (obj.dataSet) {
                return obj.dataSet.meta.identifier;
            }

            throw Error("Unknown object!");
        }

        if (!isPlainObject(uri)) {
            return this.getObjectDetails(uri).then((data) => idFinder(data));
        }
        return Promise.resolve(idFinder(uri));
    }

    /**
     * Get uri of an metadata object, specified by its identifier and project id it belongs to
     *
     * @method getObjectUri
     * @param {string} projectId id of the project
     * @param identifier identifier of the metadata object
     * @return {String} uri of the metadata object
     */
    public getObjectUri(projectId: string, identifier: string): Promise<string> {
        return this.xhr
            .post(`/gdc/md/${projectId}/identifiers`, {
                body: {
                    identifierToUri: [identifier],
                },
            })
            .then((r: ApiResponse) => {
                const data = r.getData();
                const found = data.identifiers.find((pair: any) => pair.identifier === identifier);

                if (found) {
                    return found.uri;
                }

                throw new ApiResponseError(
                    `Object with identifier ${identifier} not found in project ${projectId}`,
                    r.response,
                    r.responseBody,
                );
            });
    }

    /**
     * Get uris specified by identifiers
     *
     * @method getUrisFromIdentifiers
     * @param {String} projectId id of the project
     * @param {Array} identifiers identifiers of the metadata objects
     * @return {Array} array of identifier + uri pairs
     */
    public getUrisFromIdentifiers(projectId: string, identifiers: string[]): Promise<IUriIdentifierPair[]> {
        if (!identifiers.length) {
            return Promise.resolve([]);
        }

        return this.xhr
            .post(`/gdc/md/${projectId}/identifiers`, {
                body: {
                    identifierToUri: identifiers,
                },
            })
            .then((r: ApiResponse<{ identifiers: IUriIdentifierPair[] }>) => r.getData())
            .then((data) => {
                return data.identifiers;
            });
    }

    /**
     * Get identifiers specified by uris
     *
     * @method getIdentifiersFromUris
     * @param {String} projectId id of the project
     * @param {Array} uris of the metadata objects
     * @return {Array} array of identifier + uri pairs
     */
    public getIdentifiersFromUris(projectId: string, uris: string[]): Promise<IUriIdentifierPair[]> {
        return this.xhr
            .post(`/gdc/md/${projectId}/identifiers`, {
                body: {
                    uriToIdentifier: uris,
                },
            })
            .then((r: ApiResponse<{ identifiers: IUriIdentifierPair[] }>) => r.getData())
            .then((data) => {
                return data.identifiers;
            });
    }

    /**
     * Get attribute elements with their labels and uris.
     *
     * @param {String} projectId id of the project
     * @param {String} labelUri uri of the label (display form)
     * @param {Array<String>} patterns elements labels/titles (for EXACT mode), or patterns (for WILD mode)
     * @param {('EXACT'|'WILD')} mode match mode, currently only EXACT supported
     * @return {Array} array of elementLabelUri objects
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public translateElementLabelsToUris(
        projectId: string,
        labelUri: string,
        patterns: string[],
        mode = "EXACT",
    ) {
        return this.xhr
            .post(`/gdc/md/${projectId}/labels`, {
                body: {
                    elementLabelToUri: [
                        {
                            labelUri,
                            mode,
                            patterns,
                        },
                    ],
                },
            })
            .then((r: ApiResponse) => (r.response.ok ? get(r.getData(), "elementLabelUri") : r.response));
    }

    /**
     * Get valid elements of an attribute, specified by its identifier and project id it belongs to
     *
     * @method getValidElements
     * @param {string} projectId id of the project
     * @param id display form id of the metadata object
     * @param {Object} options objects with options:
     *      - limit {Number}
     *      - offset {Number}
     *      - order {String} 'asc' or 'desc'
     *      - filter {String}
     *      - prompt {String}
     *      - uris {Array}
     *      - complement {Boolean}
     *      - includeTotalCountWithoutFilters {Boolean}
     *      - restrictiveDefinition {String}
     *      - afm {Object}
     * @return {Object} ValidElements response with:
     *      - items {Array} elements
     *      - paging {Object}
     *      - elementsMeta {Object}
     */
    public getValidElements(
        projectId: string,
        id: string,
        options: GdcMetadata.IValidElementsParams = {},
    ): Promise<GdcMetadata.IValidElementsResponse> {
        const query = pickBy(
            pick(options, ["limit", "offset", "order", "filter", "prompt"]),
            (val) => val !== undefined,
        );
        const queryParams = queryString(query);
        const pickedOptions = pick(options, [
            "uris",
            "complement",
            "includeTotalCountWithoutFilters",
            "restrictiveDefinition",
        ]);
        const { afm } = options;

        const getRequestBodyWithReportDefinition = () =>
            this.xhr
                .post(`/gdc/app/projects/${projectId}/executeAfm/debug`, {
                    body: {
                        execution: {
                            afm,
                        },
                    },
                })
                .then((response) => response.getData())
                .then((reportDefinitionResult) => ({
                    ...pickedOptions,
                    restrictiveDefinitionContent:
                        reportDefinitionResult.reportDefinitionWithInlinedMetrics.content,
                }));

        const getOptions = afm ? getRequestBodyWithReportDefinition : () => Promise.resolve(pickedOptions);

        return getOptions().then((requestBody) =>
            this.xhr.postParsed<GdcMetadata.IValidElementsResponse>(
                `/gdc/md/${projectId}/obj/${id}/validElements${queryParams}`.replace(/\?$/, ""),
                {
                    body: {
                        validElementsRequest: requestBody,
                    },
                },
            ),
        );
    }

    /**
     * Get visualization by Uri and process data
     *
     * @method getVisualization
     * @param {String} visualizationUri
     */
    public getVisualization(uri: string): Promise<GdcVisualizationObject.IVisualization> {
        return this.getObjectDetails(uri).then(
            (visualizationObject: GdcVisualizationObject.IVisualizationObjectResponse) => {
                const mdObject = visualizationObject.visualizationObject;
                return {
                    visualizationObject: mdObject,
                };
            },
        );
    }

    /**
     * Save visualization
     *
     * @method saveVisualization
     * @param {String} visualizationUri
     */
    public saveVisualization(
        projectId: string,
        visualization: GdcVisualizationObject.IVisualization,
    ): Promise<{
        visualizationObject: GdcVisualizationObject.IVisualizationObject;
    }> {
        return this.createObject(projectId, { visualizationObject: visualization.visualizationObject });
    }

    /**
     * Update visualization
     *
     * @method updateVisualization
     * @param {String} visualizationUri
     */
    public updateVisualization(
        projectId: string,
        visualizationUri: string,
        visualization: GdcVisualizationObject.IVisualization,
    ): Promise<{ uri: string }> {
        const objectId = visualizationUri.split("/").slice(-1)[0];
        return this.updateObject(projectId, objectId, {
            visualizationObject: visualization.visualizationObject,
        });
    }

    /**
     * Delete visualization
     *
     * @method deleteVisualization
     * @param {String} visualizationUri
     */
    public deleteVisualization(visualizationUri: string): Promise<ApiResponse<any>> {
        return this.deleteObject(visualizationUri);
    }

    /**
     * Delete object
     *
     * @experimental
     * @method deleteObject
     * @param {String} uri of the object to be deleted
     */
    public deleteObject(uri: string): Promise<ApiResponse<any>> {
        return this.xhr.del(uri);
    }

    /**
     * Bulk delete objects
     */
    public async bulkDeleteObjects(
        projectId: string,
        uris: string[],
        mode: "cascade" | "multi" = "cascade",
    ): Promise<void> {
        const uri = `/gdc/md/${projectId}/objects/delete`;
        const data = {
            delete: {
                items: uris,
                mode,
            },
        };

        await this.xhr.post(uri, { data });
    }

    /**
     * Create object
     *
     * @experimental
     * @method createObject
     * @param {String} projectId
     * @param {String} obj object definition
     */
    public createObject<T extends GdcMetadataObject.WrappedObject = GdcMetadataObject.WrappedObject>(
        projectId: string,
        obj: T,
    ): Promise<T> {
        return this.xhr.postParsed<T>(`/gdc/md/${projectId}/obj?createAndGet=true`, {
            body: obj,
        });
    }

    /**
     * Update object
     *
     * @experimental
     * @method updateObject
     * @param {String} projectId
     * @param {String} objectId
     * @param {String} obj object definition
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public updateObject(projectId: string, objectId: string, obj: any): Promise<any> {
        return this.xhr
            .put(`/gdc/md/${projectId}/obj/${objectId}`, {
                body: obj,
            })
            .then((r: ApiResponse) => r.getData());
    }

    /**
     * Converts the visualization object to legacy report.
     * @param {String} projectId
     * @param mdObject visualization object to convert
     * @return uri to the converted report
     */
    public openVisualizationAsReport(
        projectId: string,
        mdObject: GdcVisualizationObject.IVisualization,
    ): Promise<string> {
        return this.xhr
            .post(`/gdc/internal/projects/${projectId}/convertVisualizationObject`, {
                body: mdObject,
            })
            .then((res) => res.getData())
            .then(({ uri }) => uri);
    }

    /**
     * LDM manage
     *
     * @experimental
     * @method ldmManage
     * @param {String} projectId
     * @param {String} maql
     * @param {Object} options for polling (maxAttempts, pollStep)
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public ldmManage(projectId: string, maql: string, options = {}) {
        return this.xhr
            .post(`/gdc/md/${projectId}/ldm/manage2`, { body: { manage: { maql } } })
            .then((r: ApiResponse) => r.getData())
            .then((response: any) => {
                const manageStatusUri = response.entries[0].link;
                return handlePolling(
                    this.xhr.get.bind(this.xhr),
                    manageStatusUri,
                    this.isTaskFinished,
                    options,
                );
            })
            .then(this.checkStatusForError);
    }

    /**
     * ETL pull
     *
     * @experimental
     * @method etlPull
     * @param {String} projectId
     * @param {String} uploadsDir
     * @param {Object} options for polling (maxAttempts, pollStep)
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public etlPull(projectId: string, uploadsDir: string, options = {}) {
        return this.xhr
            .post(`/gdc/md/${projectId}/etl/pull2`, { body: { pullIntegration: uploadsDir } })
            .then((r: ApiResponse) => r.getData())
            .then((response: any) => {
                const etlPullStatusUri = response.pull2Task.links.poll;
                return handlePolling(
                    this.xhr.get.bind(this.xhr),
                    etlPullStatusUri,
                    this.isTaskFinished,
                    options,
                );
            })
            .then(this.checkStatusForError);
    }

    private isTaskFinished(task: any) {
        const taskState = task.wTaskStatus.status;
        return taskState === "OK" || taskState === "ERROR";
    }

    private checkStatusForError(response: any) {
        if (response.wTaskStatus.status === "ERROR") {
            return Promise.reject(response);
        }
        return response;
    }
}
