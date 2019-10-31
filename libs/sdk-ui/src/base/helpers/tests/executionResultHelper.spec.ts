// (C) 2007-2018 GoodData Corporation

import { STACK_BY_DIMENSION_INDEX, VIEW_BY_DIMENSION_INDEX } from "../../constants/dimensions";
import { findAttributeInDimension, findMeasureGroupInDimensions } from "../executionResultHelper";
import * as fixtures from "../../../../__mocks__/fixtures";
import { IAttributeDescriptor, IMeasureGroupDescriptor } from "@gooddata/sdk-backend-spi";

describe("findMeasureGroupInDimensions", () => {
    const sampleDimensions = fixtures.barChartWithStackByAndViewByAttributes.dimensions();

    it("should return the measure group header", () => {
        const returnValue = findMeasureGroupInDimensions(sampleDimensions);
        const expectedValue = (sampleDimensions[VIEW_BY_DIMENSION_INDEX]
            .headers[1] as IMeasureGroupDescriptor).measureGroupHeader;
        expect(returnValue).toBe(expectedValue);
    });

    it("should throw an error if measureGroup is not the last header on it's dimension", () => {
        const invalidDimensions = [
            {
                ...sampleDimensions[VIEW_BY_DIMENSION_INDEX],
                headers: [
                    ...sampleDimensions[VIEW_BY_DIMENSION_INDEX].headers,
                    ...sampleDimensions[STACK_BY_DIMENSION_INDEX].headers,
                ],
            },
        ];
        expect(findMeasureGroupInDimensions.bind(this, invalidDimensions)).toThrow();
    });
});

describe("findAttributeInDimension", () => {
    const dimensions = fixtures.barChartWithStackByAndViewByAttributes.dimensions();
    const headerItems = fixtures.barChartWithStackByAndViewByAttributes.allHeaders();
    it("should return the view by attribute header with header items", () => {
        const returnValue = findAttributeInDimension(
            dimensions[VIEW_BY_DIMENSION_INDEX],
            headerItems[VIEW_BY_DIMENSION_INDEX],
        );
        const expectedValue = {
            ...(dimensions[VIEW_BY_DIMENSION_INDEX].headers[0] as IAttributeDescriptor).attributeHeader,
            items: headerItems[VIEW_BY_DIMENSION_INDEX][0],
        };
        expect(returnValue).toEqual(expectedValue);
    });
    it("should return the stack by attribute header with header items", () => {
        const returnValue = findAttributeInDimension(
            dimensions[STACK_BY_DIMENSION_INDEX],
            headerItems[STACK_BY_DIMENSION_INDEX],
        );
        const expectedValue = {
            ...(dimensions[STACK_BY_DIMENSION_INDEX].headers[0] as IAttributeDescriptor).attributeHeader,
            items: headerItems[STACK_BY_DIMENSION_INDEX][0],
        };
        expect(returnValue).toEqual(expectedValue);
    });
});
