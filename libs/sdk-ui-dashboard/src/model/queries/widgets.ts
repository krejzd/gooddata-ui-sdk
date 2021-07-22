// (C) 2021 GoodData Corporation

import { IFilter, ObjRef } from "@gooddata/sdk-model";
import { IDashboardQuery } from "./base";

/**
 * Given a reference to a widget, this query will obtain the filters that should be used when executing it.
 * These will respect the ignored filters on widget level as well as the filters specified in the insight itself.
 * Filters returned by this query should be used with {@link @gooddata/sdk-model#insightSetFilters} to obtain
 * insight that is ready for execution or used to execute a KPI.
 *
 * @alpha
 */
export interface QueryWidgetFilters extends IDashboardQuery<IFilter[]> {
    readonly type: "GDC.DASH/QUERY.WIDGET.FILTERS";
    readonly payload: {
        readonly widgetRef: ObjRef;
        readonly widgetFilterOverrides: IFilter[] | undefined;
    };
}

/**
 * Creates action thought which you can query dashboard component for filters that should be used by a given widget.
 *
 * @param widgetRef - reference to insight widget
 * @param widgetFilterOverrides - optionally specify filters to be applied on top of the dashboard and insight filters
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function queryWidgetFilters(
    widgetRef: ObjRef,
    widgetFilterOverrides?: IFilter[],
    correlationId?: string,
): QueryWidgetFilters {
    return {
        type: "GDC.DASH/QUERY.WIDGET.FILTERS",
        correlationId,
        payload: {
            widgetRef,
            widgetFilterOverrides,
        },
    };
}
