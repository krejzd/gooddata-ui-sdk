// (C) 2020 GoodData Corporation
import React from "react";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import { isWidget, isDashboardWidget, UnexpectedError, isInsightWidget } from "@gooddata/sdk-backend-spi";

import { selectAlerts, useDashboardSelector } from "../../../model";
import { DashboardItem } from "../../presentationComponents";

import { DashboardWidgetProps } from "./types";
import { DashboardWidgetPropsProvider, useDashboardWidgetProps } from "./DashboardWidgetPropsContext";
import { DashboardKpiPropsProvider } from "../kpi/DashboardKpiPropsContext";
import { DashboardKpi } from "../kpi/DashboardKpi";
import { DefaultDashboardInsightWidget } from "./DefaultDashboardInsightWidget";

/**
 * @internal
 */
export const DefaultDashboardWidgetInner = (): JSX.Element => {
    const { onError, onFiltersChange, screen, widget } = useDashboardWidgetProps();
    const alerts = useDashboardSelector(selectAlerts);

    const alert = isWidget(widget)
        ? alerts?.find((alert) => areObjRefsEqual(alert.widget, widget.ref))
        : undefined;

    if (!isDashboardWidget) {
        throw new UnexpectedError(
            "Cannot render custom widget with DefaultWidgetRenderer! Please handle custom widget rendering in your widgetRenderer.",
        );
    }

    if (isWidget(widget)) {
        if (isInsightWidget(widget)) {
            return <DefaultDashboardInsightWidget widget={widget} screen={screen} />;
        }

        return (
            <DashboardItem className="type-kpi" screen={screen}>
                <DashboardKpiPropsProvider
                    kpiWidget={widget}
                    alert={alert}
                    onFiltersChange={onFiltersChange}
                    onError={onError}
                >
                    <DashboardKpi />
                </DashboardKpiPropsProvider>
            </DashboardItem>
        );
    }

    return <div>Unknown widget</div>;
};

/**
 * @internal
 */
export const DefaultDashboardWidget = (props: DashboardWidgetProps): JSX.Element => {
    return (
        <DashboardWidgetPropsProvider {...props}>
            <DefaultDashboardWidgetInner />
        </DashboardWidgetPropsProvider>
    );
};
