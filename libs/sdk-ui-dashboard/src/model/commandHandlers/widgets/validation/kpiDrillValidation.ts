// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { SagaReturnType, select } from "redux-saga/effects";
import { KpiDrillDefinition } from "@gooddata/sdk-model";

import { DashboardContext } from "../../../types/commonTypes";
import { internalErrorOccurred, invalidArgumentsProvided } from "../../../events/general";
import { selectLegacyDashboards } from "../../../store/legacyDashboards/legacyDashboardsSelectors";
import { IDashboardCommand } from "../../../commands";
import { validateKpiDrillTarget } from "./kpiDrillValidationUtils";

export function* validateKpiDrill(
    drill: KpiDrillDefinition,
    ctx: DashboardContext,
    cmd: IDashboardCommand,
): SagaIterator<void> {
    const legacyDashboards: SagaReturnType<typeof selectLegacyDashboards> = yield select(
        selectLegacyDashboards,
    );

    if (!legacyDashboards) {
        throw internalErrorOccurred(
            ctx,
            cmd,
            "KPI drill validation called when legacy dashboards have not yet been loaded.",
        );
    }

    try {
        validateKpiDrillTarget(drill, legacyDashboards);
    } catch (ex) {
        const messageDetail = (ex as Error).message;
        throw invalidArgumentsProvided(ctx, cmd, `Invalid KPI drill target. Error: ${messageDetail}`);
    }
}
