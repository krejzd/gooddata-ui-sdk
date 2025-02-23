// (C) 2007-2021 GoodData Corporation
import { Attribute, Catalog, Fact, Metric } from "../../base/types";
import {
    JsonApiAttributeOutList,
    JsonApiFactOutList,
    JsonApiMetricOutList,
    ITigerClient,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { convertAttribute, createLabelMap } from "./tigerCommon";

function convertMetrics(metrics: JsonApiMetricOutList): Metric[] {
    return metrics.data.map((metric) => {
        return {
            metric: {
                meta: {
                    identifier: metric.id,
                    title: metric.attributes?.title ?? metric.id,
                    tags: metric.attributes?.tags?.join(",") ?? "",
                },
            },
        };
    });
}

function convertFacts(facts: JsonApiFactOutList): Fact[] {
    return facts.data.map((fact) => {
        return {
            fact: {
                meta: {
                    identifier: fact.id,
                    title: fact.attributes?.title ?? fact.id,
                    tags: fact.attributes?.tags?.join(",") ?? "",
                },
            },
        };
    });
}

function convertAttributes(attributes: JsonApiAttributeOutList): Attribute[] {
    const labels = createLabelMap(attributes.included);

    /*
     * Filter out date data set attributes. Purely because there is special processing for them
     * in catalog & code generators. Want to stick to that.
     *
     */

    return attributes.data
        .filter((attribute) => attribute.attributes?.granularity === undefined)
        .map((attribute) => convertAttribute(attribute, labels))
        .filter((a): a is Attribute => a !== undefined);
}

/**
 * Loads metric, attribute and fact catalog
 *
 * @param client
 * @param workspaceId
 */
export async function loadCatalog(client: ITigerClient, workspaceId: string): Promise<Catalog> {
    const [metricsResult, factsResult, attributesResult] = await Promise.all([
        MetadataUtilities.getAllPagesOf(client, client.workspaceObjects.getEntitiesMetrics, {
            workspaceId,
        }).then(MetadataUtilities.mergeEntitiesResults),
        MetadataUtilities.getAllPagesOf(client, client.workspaceObjects.getEntitiesFacts, {
            workspaceId,
        }).then(MetadataUtilities.mergeEntitiesResults),
        MetadataUtilities.getAllPagesOf(
            client,
            client.workspaceObjects.getEntitiesAttributes,
            { workspaceId },
            { query: { include: "labels" } },
        ).then(MetadataUtilities.mergeEntitiesResults),
    ]);

    return {
        metrics: convertMetrics(metricsResult),
        facts: convertFacts(factsResult),
        attributes: convertAttributes(attributesResult),
    };
}
