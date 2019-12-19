// (C) 2007-2019 GoodData Corporation
import "./polyfills";
// import { ICommonVisualizationProps } from "./_defunct/to_delete/VisualizationLoadingHOC";
import { Kpi } from "./kpi/Kpi";
// import { Visualization } from "./_defunct/uri/Visualization";
// import { Execute } from "./execution/Execute";
import { withExecution } from "./execution/withExecution";
import { Executor } from "./execution/Executor";
// tslint:disable-next-line:no-duplicate-imports

export { Kpi, Executor, withExecution };

// new exports

export * from "./base";
export * from "./charts";
export * from "./highcharts";
export * from "./pivotTable";
export * from "./filters";

import { InsightView } from "./insightView/InsightView";
export { InsightView };
