// (C) 2020-2021 GoodData Corporation

import { transformResultDimensions } from "../dimensions";
import { mockDimensions, mockMultipleDimensions } from "./dimensions.fixture";
import {
    defWithDimensions,
    emptyDef,
    idRef,
    MeasureGroupIdentifier,
    newDefForItems,
    newDimension,
    newMeasure,
    newTotal,
} from "@gooddata/sdk-model";

describe("transformResultDimensions", () => {
    it("should fill in uris and refs for attribute descriptors", () => {
        expect(transformResultDimensions(mockDimensions, emptyDef("test"))).toMatchSnapshot();
    });

    it("should fill in uris and refs for attribute descriptors and simple measure descriptors", () => {
        expect(
            transformResultDimensions(
                mockDimensions,
                newDefForItems("test", [
                    newMeasure(idRef("measureIdentifier", "measure"), (m) => m.localId("measureLocalId")),
                ]),
            ),
        ).toMatchSnapshot();
    });

    const Total1 = newTotal("sum", "measureLocalId", "localAttr1");
    const Subtotal1 = newTotal("sum", "measureLocalId", "localAttr2");
    const Total2 = newTotal("max", "measureLocalId", "localAttr3");
    const TotalDef = defWithDimensions(
        emptyDef("test"),
        newDimension(["localAttr1", "localAttr2"], [Total1, Subtotal1]),
        newDimension([MeasureGroupIdentifier]),
        newDimension(["localAttr3"], [Total2]),
    );
    it("should fill in totals", () => {
        expect(transformResultDimensions(mockMultipleDimensions, TotalDef)).toMatchSnapshot();
    });
});
