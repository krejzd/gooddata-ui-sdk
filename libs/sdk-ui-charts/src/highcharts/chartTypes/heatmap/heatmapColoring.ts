// (C) 2020-2021 GoodData Corporation
import {
    ColorStrategy,
    ICreateColorAssignmentReturnValue,
    getColorByGuid,
    getColorFromMapping,
    getRgbStringFromRGB,
    isCustomPalette,
    normalizeColorToRGB,
} from "@gooddata/sdk-ui-vis-commons";
import { IColorPalette, IRgbColorValue, isColorFromPalette, isRgbColor } from "@gooddata/sdk-model";
import { isDarkTheme } from "@gooddata/sdk-ui-theme-provider";
import { IColorMapping } from "../../../interfaces";
import { IColorAssignment, IMappingHeader, DataViewFacade } from "@gooddata/sdk-ui";
import { findMeasureGroupInDimensions } from "../_util/executionResultHelper";
import range from "lodash/range";
import isEqual from "lodash/isEqual";
import { DEFAULT_HEATMAP_BLUE_COLOR, HEATMAP_BLUE_COLOR_PALETTE } from "../_util/color";
import { darken, mix, saturate } from "polished";

type HighChartColorPalette = string[];

export class HeatmapColorStrategy extends ColorStrategy {
    public getColorByIndex(index: number): string {
        return this.palette[index % this.palette.length];
    }

    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        _viewByAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        _stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        let mappedColor;
        let colorAssignment: IColorAssignment[];
        const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());
        const headerItem = measureGroup && measureGroup.items[0];
        if (colorMapping) {
            mappedColor = getColorFromMapping(headerItem, colorMapping, dv);
            if (mappedColor) {
                colorAssignment = [
                    {
                        headerItem,
                        color: mappedColor,
                    },
                ];
            }
        }

        colorAssignment = colorAssignment || this.getDefaultColorAssignment(colorPalette, headerItem);

        return {
            fullColorAssignment: colorAssignment,
            outputColorAssignment: colorAssignment,
        };
    }

    private getThemeBackgroundColor() {
        return this.theme?.chart?.backgroundColor ?? this.theme?.palette?.complementary?.c0;
    }

    private getBackgroundColor() {
        return this.getThemeBackgroundColor() ?? "#fff";
    }

    protected createPalette(colorPalette: IColorPalette, colorAssignment: IColorAssignment[]): string[] {
        if (
            isRgbColor(colorAssignment[0].color) &&
            isEqual(colorAssignment[0].color.value, DEFAULT_HEATMAP_BLUE_COLOR) &&
            normalizeColorToRGB(this.getBackgroundColor()) === "rgb(255,255,255)"
        ) {
            return HEATMAP_BLUE_COLOR_PALETTE;
        }

        if (isColorFromPalette(colorAssignment[0].color)) {
            return this.getCustomHeatmapColorPalette(
                getColorByGuid(colorPalette, colorAssignment[0].color.value as string, 0),
            );
        }

        return this.getCustomHeatmapColorPalette(colorAssignment[0].color.value as IRgbColorValue);
    }

    private getCustomHeatmapColorPalette(baseColorRGB: IRgbColorValue): HighChartColorPalette {
        const themeBackgroundColor = this.getThemeBackgroundColor();
        const backgroundColor = this.getBackgroundColor();
        const baseColor = getRgbStringFromRGB(baseColorRGB);
        const baseColorLast = saturate(0.16, darken(0.2, baseColor));

        if (themeBackgroundColor && !isDarkTheme(this.theme)) {
            return [
                ...this.generatePalette(baseColor, backgroundColor, 5),
                ...this.generatePalette(baseColorLast, baseColor, 3).slice(1), // Need to remove overlapping color with slice
            ];
        } else {
            return this.generatePalette(baseColor, backgroundColor, 7);
        }
    }

    private generatePalette(colorA: string, colorB: string, steps: number): string[] {
        return range(steps).map((step) => normalizeColorToRGB(mix((1 / (steps - 1)) * step, colorA, colorB)));
    }

    private getDefaultColorAssignment(
        colorPalette: IColorPalette,
        headerItem: IMappingHeader,
    ): IColorAssignment[] {
        const hasCustomPaletteWithColors = colorPalette && isCustomPalette(colorPalette) && colorPalette[0];
        if (hasCustomPaletteWithColors) {
            return [
                {
                    headerItem,
                    color: {
                        type: "guid",
                        value: colorPalette[0].guid,
                    },
                },
            ];
        }

        return [
            {
                headerItem,
                color: {
                    type: "rgb",
                    value: DEFAULT_HEATMAP_BLUE_COLOR,
                },
            },
        ];
    }
}
