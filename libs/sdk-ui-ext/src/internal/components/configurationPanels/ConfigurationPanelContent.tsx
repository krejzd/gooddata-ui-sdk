// (C) 2019 GoodData Corporation
import React from "react";
import { ChartType, DefaultLocale } from "@gooddata/sdk-ui";

import { IReferences, IVisualizationProperties } from "../../interfaces/Visualization";
import { IColorConfiguration } from "../../interfaces/Colors";
import ColorsSection from "../configurationControls/colors/ColorsSection";
import LegendSection from "../configurationControls/legend/LegendSection";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider";
import { IInsightDefinition, insightHasMeasures } from "@gooddata/sdk-model";
import { getMeasuresFromMdObject } from "../../utils/bucketHelper";
import { ISettings } from "@gooddata/sdk-backend-spi";
import noop from "lodash/noop";

export interface IConfigurationPanelContentProps {
    properties?: IVisualizationProperties;
    references?: IReferences;
    propertiesMeta?: any;
    colors?: IColorConfiguration;
    locale: string;
    type?: ChartType;
    isError?: boolean;
    isLoading?: boolean;
    insight?: IInsightDefinition;
    featureFlags?: ISettings;
    axis?: string;
    pushData?(data: any): void;
    panelConfig?: any;
}

export default abstract class ConfigurationPanelContent extends React.PureComponent<IConfigurationPanelContentProps> {
    public static defaultProps: IConfigurationPanelContentProps = {
        properties: null,
        references: null,
        propertiesMeta: null,
        colors: null,
        locale: DefaultLocale,
        isError: false,
        isLoading: false,
        insight: null,
        pushData: noop,
        featureFlags: {},
        axis: null,
        panelConfig: {},
    };

    protected supportedPropertiesList: string[];

    public render(): React.ReactNode {
        return (
            <div key={`config-${this.props.type}`}>
                <InternalIntlWrapper locale={this.props.locale}>
                    {this.renderConfigurationPanel()}
                </InternalIntlWrapper>
            </div>
        );
    }

    protected abstract renderConfigurationPanel(): React.ReactNode;

    protected isControlDisabled(): boolean {
        const { insight, isError, isLoading } = this.props;
        return !insight || !insightHasMeasures(insight) || isError || isLoading;
    }

    protected renderColorSection(): React.ReactNode {
        const {
            properties,
            propertiesMeta,
            pushData,
            colors,
            featureFlags,
            references,
            insight,
            isLoading,
        } = this.props;

        const controlsDisabled = this.isControlDisabled();
        const hasMeasures = getMeasuresFromMdObject(insight).length > 0;

        return (
            <ColorsSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                references={references}
                colors={colors}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
                hasMeasures={hasMeasures}
                showCustomPicker={featureFlags.enableCustomColorPicker as boolean}
                isLoading={isLoading}
            />
        );
    }

    protected renderLegendSection(): React.ReactNode {
        const { properties, propertiesMeta, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();

        return (
            <LegendSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
            />
        );
    }
}
