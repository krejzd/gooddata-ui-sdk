## API Report File for "@gooddata/sdk-backend-base"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { AttributeModifications } from '@gooddata/sdk-model';
import { CatalogItem } from '@gooddata/sdk-backend-spi';
import { CatalogItemType } from '@gooddata/sdk-backend-spi';
import { DateAttributeGranularity } from '@gooddata/sdk-model';
import { DimensionGenerator } from '@gooddata/sdk-model';
import { ErrorConverter } from '@gooddata/sdk-backend-spi';
import { IAnalyticalBackend } from '@gooddata/sdk-backend-spi';
import { IAnalyticalBackendConfig } from '@gooddata/sdk-backend-spi';
import { IAttribute } from '@gooddata/sdk-model';
import { IAttributeDisplayFormMetadataObject } from '@gooddata/sdk-backend-spi';
import { IAttributeMetadataObject } from '@gooddata/sdk-backend-spi';
import { IAttributeOrMeasure } from '@gooddata/sdk-model';
import { IAuthenticatedPrincipal } from '@gooddata/sdk-backend-spi';
import { IAuthenticationContext } from '@gooddata/sdk-backend-spi';
import { IAuthenticationProvider } from '@gooddata/sdk-backend-spi';
import { IBucket } from '@gooddata/sdk-model';
import { ICatalogAttribute } from '@gooddata/sdk-backend-spi';
import { ICatalogDateAttribute } from '@gooddata/sdk-backend-spi';
import { ICatalogDateDataset } from '@gooddata/sdk-backend-spi';
import { ICatalogFact } from '@gooddata/sdk-backend-spi';
import { ICatalogGroup } from '@gooddata/sdk-backend-spi';
import { ICatalogMeasure } from '@gooddata/sdk-backend-spi';
import { IDashboardFilterReference } from '@gooddata/sdk-backend-spi';
import { IDashboardMetadataObject } from '@gooddata/sdk-backend-spi';
import { IDataSetMetadataObject } from '@gooddata/sdk-backend-spi';
import { IDataView } from '@gooddata/sdk-backend-spi';
import { IDimension } from '@gooddata/sdk-model';
import { IDimensionDescriptor } from '@gooddata/sdk-backend-spi';
import { IExecutionDefinition } from '@gooddata/sdk-model';
import { IExecutionFactory } from '@gooddata/sdk-backend-spi';
import { IExecutionResult } from '@gooddata/sdk-backend-spi';
import { IExportConfig } from '@gooddata/sdk-backend-spi';
import { IExportResult } from '@gooddata/sdk-backend-spi';
import { IFactMetadataObject } from '@gooddata/sdk-backend-spi';
import { IGroupableCatalogItemBase } from '@gooddata/sdk-backend-spi';
import { IInsight } from '@gooddata/sdk-model';
import { IInsightDefinition } from '@gooddata/sdk-model';
import { IInsightWidget } from '@gooddata/sdk-backend-spi';
import { IInsightWidgetDefinition } from '@gooddata/sdk-backend-spi';
import { IKpiWidget } from '@gooddata/sdk-backend-spi';
import { IKpiWidgetDefinition } from '@gooddata/sdk-backend-spi';
import { ILegacyKpi } from '@gooddata/sdk-backend-spi';
import { ILegacyKpiComparisonDirection } from '@gooddata/sdk-backend-spi';
import { ILegacyKpiComparisonTypeComparison } from '@gooddata/sdk-backend-spi';
import { IMeasure } from '@gooddata/sdk-model';
import { IMeasureMetadataObject } from '@gooddata/sdk-backend-spi';
import { IMetadataObject } from '@gooddata/sdk-backend-spi';
import { InsightDrillDefinition } from '@gooddata/sdk-backend-spi';
import { INullableFilter } from '@gooddata/sdk-model';
import { IPagedResource } from '@gooddata/sdk-backend-spi';
import { IPostProcessing } from '@gooddata/sdk-model';
import { IPreparedExecution } from '@gooddata/sdk-backend-spi';
import { IResultHeader } from '@gooddata/sdk-backend-spi';
import { ISecuritySettingsService } from '@gooddata/sdk-backend-spi';
import { ISortItem } from '@gooddata/sdk-model';
import { IVariableMetadataObject } from '@gooddata/sdk-backend-spi';
import { IWidget } from '@gooddata/sdk-backend-spi';
import { IWorkspaceCatalog } from '@gooddata/sdk-backend-spi';
import { IWorkspaceCatalogAvailableItemsFactory } from '@gooddata/sdk-backend-spi';
import { IWorkspaceCatalogFactory } from '@gooddata/sdk-backend-spi';
import { IWorkspaceCatalogFactoryOptions } from '@gooddata/sdk-backend-spi';
import { KpiDrillDefinition } from '@gooddata/sdk-backend-spi';
import { MeasureBuilder } from '@gooddata/sdk-model';
import { MeasureModifications } from '@gooddata/sdk-model';
import { NotAuthenticated } from '@gooddata/sdk-backend-spi';
import { ObjRef } from '@gooddata/sdk-model';
import { ValidationContext } from '@gooddata/sdk-backend-spi';
import { VisualizationProperties } from '@gooddata/sdk-model';

// @internal
export abstract class AbstractExecutionFactory implements IExecutionFactory {
    constructor(workspace: string);
    // (undocumented)
    forBuckets(buckets: IBucket[], filters?: INullableFilter[]): IPreparedExecution;
    // (undocumented)
    abstract forDefinition(def: IExecutionDefinition): IPreparedExecution;
    // (undocumented)
    forInsight(insight: IInsightDefinition, filters?: INullableFilter[]): IPreparedExecution;
    // (undocumented)
    forInsightByRef(insight: IInsight, filters?: INullableFilter[]): IPreparedExecution;
    // (undocumented)
    forItems(items: IAttributeOrMeasure[], filters?: INullableFilter[]): IPreparedExecution;
    // (undocumented)
    protected readonly workspace: string;
}

// @beta
export type AnalyticalBackendCallbacks = {
    beforeExecute?: (def: IExecutionDefinition) => void;
    successfulExecute?: (result: IExecutionResult) => void;
    successfulResultReadAll?: (dataView: IDataView) => void;
    failedResultReadAll?: (error: any) => void;
    successfulResultReadWindow?: (offset: number[], size: number[], dataView: IDataView) => void;
    failedResultReadWindow?: (offset: number[], size: number[], error: any) => void;
};

// @public
export class AnonymousAuthProvider implements IAuthProviderCallGuard {
    // (undocumented)
    authenticate(_context: IAuthenticationContext): Promise<IAuthenticatedPrincipal>;
    // (undocumented)
    deauthenticate(_context: IAuthenticationContext): Promise<void>;
    // (undocumented)
    getCurrentPrincipal(_context: IAuthenticationContext): Promise<IAuthenticatedPrincipal | null>;
    // (undocumented)
    reset(): void;
}

// @beta (undocumented)
export type ApiClientProvider = (config: CustomBackendConfig) => any;

// @beta
export class AttributeDisplayFormMetadataObjectBuilder<T extends IAttributeDisplayFormMetadataObject = IAttributeDisplayFormMetadataObject> extends MetadataObjectBuilder<T> {
    // (undocumented)
    attribute(ref: ObjRef): this;
    // (undocumented)
    displayFormType(type: string | undefined): this;
    // (undocumented)
    isDefault(value: boolean | undefined): this;
}

// @beta
export class AttributeMetadataObjectBuilder<T extends IAttributeMetadataObject = IAttributeMetadataObject> extends MetadataObjectBuilder<T> {
    // (undocumented)
    displayForms(displayForms: IAttributeDisplayFormMetadataObject[]): this;
    // (undocumented)
    drillDownStep(ref: ObjRef | undefined): this;
}

// @beta
export type AuthenticatedAsyncCall<TSdk, TReturn> = (sdk: TSdk, context: IAuthenticatedAsyncCallContext) => Promise<TReturn>;

// @beta
export type AuthenticatedCallGuard<TSdk = any> = <TReturn>(call: AuthenticatedAsyncCall<TSdk, TReturn>, errorConverter?: ErrorConverter) => Promise<TReturn>;

// @internal
export class AuthProviderCallGuard implements IAuthProviderCallGuard {
    constructor(realProvider: IAuthenticationProvider);
    // (undocumented)
    authenticate: (context: IAuthenticationContext) => Promise<IAuthenticatedPrincipal>;
    // (undocumented)
    deauthenticate(context: IAuthenticationContext): Promise<void>;
    // (undocumented)
    getCurrentPrincipal(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal | null>;
    // (undocumented)
    initializeClient: (client: any) => void;
    // (undocumented)
    onNotAuthenticated: (context: IAuthenticationContext, error: NotAuthenticated) => void;
    // (undocumented)
    reset: () => void;
}

// @beta
export class Builder<T> implements IBuilder<T> {
    constructor(item: Partial<T>, validator?: ((item: Partial<T>) => void) | undefined);
    // (undocumented)
    build(): T;
    // (undocumented)
    protected item: Partial<T>;
    // (undocumented)
    modify(modifications: BuilderModifications<this, T>): this;
    // (undocumented)
    validate(): this;
    // (undocumented)
    protected validator?: ((item: Partial<T>) => void) | undefined;
}

// @beta
export type BuilderConstructor<TBuilder extends IBuilder<TItem>, TItem> = new (item: Partial<TItem>) => TBuilder;

// @beta
export function builderFactory<TItem, TBuilder extends Builder<TItem>, TBuilderConstructor extends BuilderConstructor<TBuilder, TItem>>(Builder: TBuilderConstructor, defaultItem: Partial<TItem>, modifications: BuilderModifications<TBuilder, TItem>): TItem;

// @beta
export type BuilderModifications<TBuilder extends IBuilder<TItem>, TItem = ExtractBuilderType<TBuilder>> = (builder: TBuilder) => TBuilder;

// @beta
export type CacheControl = {
    resetExecutions: () => void;
    resetCatalogs: () => void;
    resetSecuritySettings: () => void;
    resetAll: () => void;
};

// @beta
export type CachingConfiguration = {
    maxExecutions: number | undefined;
    maxResultWindows: number | undefined;
    maxCatalogs: number | undefined;
    maxCatalogOptions: number | undefined;
    onCacheReady?: (cacheControl: CacheControl) => void;
    maxSecuritySettingsOrgs: number | undefined;
    maxSecuritySettingsOrgUrls: number | undefined;
    maxSecuritySettingsOrgUrlsAge: number | undefined;
};

// @beta
export class CatalogAttributeBuilder<T extends ICatalogAttribute = ICatalogAttribute> extends GroupableCatalogItemBuilder<T> {
    // (undocumented)
    attribute(attributeOrRef: IAttributeMetadataObject | ObjRef, modifications?: BuilderModifications<AttributeMetadataObjectBuilder>): this;
    // (undocumented)
    defaultDisplayForm(displayFormOrRef: IAttributeDisplayFormMetadataObject | ObjRef, modifications?: BuilderModifications<AttributeDisplayFormMetadataObjectBuilder>): this;
    // (undocumented)
    displayForms(displayForms: IAttributeDisplayFormMetadataObject[]): this;
    // (undocumented)
    geoPinDisplayForms(displayForms: IAttributeDisplayFormMetadataObject[]): this;
    // (undocumented)
    toExecutionModel(modifications?: AttributeModifications): IAttribute;
}

// @beta
export class CatalogDateAttributeBuilder<T extends ICatalogDateAttribute = ICatalogDateAttribute> extends Builder<T> {
    // (undocumented)
    attribute(attributeOrRef: IAttributeMetadataObject | ObjRef, modifications?: BuilderModifications<AttributeMetadataObjectBuilder>): this;
    // (undocumented)
    defaultDisplayForm(displayFormOrRef: IAttributeDisplayFormMetadataObject | ObjRef, modifications?: BuilderModifications<AttributeDisplayFormMetadataObjectBuilder>): this;
    // (undocumented)
    granularity(granularity: DateAttributeGranularity): this;
}

// @beta
export class CatalogDateDatasetBuilder<T extends ICatalogDateDataset = ICatalogDateDataset> extends Builder<T> {
    // (undocumented)
    dataSet(dataSetOrRef: IDataSetMetadataObject | ObjRef, modifications?: BuilderModifications<DataSetMetadataObjectBuilder>): this;
    // (undocumented)
    dateAttributes(dateAttributes: ICatalogDateAttribute[]): this;
    // (undocumented)
    relevance(relevance: number): this;
}

// @alpha (undocumented)
export type CatalogDecoratorFactory = (catalog: IWorkspaceCatalogFactory) => IWorkspaceCatalogFactory;

// @beta
export class CatalogFactBuilder<T extends ICatalogFact = ICatalogFact> extends GroupableCatalogItemBuilder<T> {
    // (undocumented)
    fact(factOrRef: IFactMetadataObject | ObjRef, modifications?: BuilderModifications<FactMetadataObjectBuilder>): this;
}

// @beta
export class CatalogGroupBuilder<T extends ICatalogGroup = ICatalogGroup> extends Builder<T> {
    // (undocumented)
    tag(tagRef: ObjRef): this;
    // (undocumented)
    title(title: string): this;
}

// @beta
export class CatalogMeasureBuilder<T extends ICatalogMeasure = ICatalogMeasure> extends GroupableCatalogItemBuilder<T> {
    // (undocumented)
    measure(measureOrRef: IMeasureMetadataObject | ObjRef, modifications?: BuilderModifications<MeasureMetadataObjectBuilder>): this;
    // (undocumented)
    toExecutionModel(modifications?: MeasureModifications<MeasureBuilder>): IMeasure;
}

// @beta
export function customBackend(config: CustomBackendConfig): IAnalyticalBackend;

// @beta (undocumented)
export type CustomBackendConfig = IAnalyticalBackendConfig & {
    readonly clientProvider: ApiClientProvider;
    readonly resultProvider: ResultProvider;
    readonly dataProvider?: DataProvider;
};

// @beta (undocumented)
export type CustomBackendState = {
    telemetry?: TelemetryData;
    authApiCall: AuthenticatedCallGuard;
};

// @beta (undocumented)
export type CustomCallContext = {
    config: CustomBackendConfig;
    state: CustomBackendState;
    client: any;
};

// @beta
export class DashboardMetadataObjectBuilder<T extends IDashboardMetadataObject = IDashboardMetadataObject> extends MetadataObjectBuilder<T> {
}

// @beta (undocumented)
export type DataProvider = (context: DataProviderContext) => Promise<IDataView>;

// @beta (undocumented)
export type DataProviderContext = CustomCallContext & {
    result: IExecutionResult;
    window?: {
        offset: number[];
        size: number[];
    };
};

// @beta
export class DataSetMetadataObjectBuilder<T extends IDataSetMetadataObject = IDataSetMetadataObject> extends MetadataObjectBuilder<T> {
}

// @alpha
export function decoratedBackend(backend: IAnalyticalBackend, decorators: DecoratorFactories): IAnalyticalBackend;

// @alpha
export class DecoratedExecutionFactory implements IExecutionFactory {
    constructor(decorated: IExecutionFactory, wrapper?: PreparedExecutionWrapper);
    // (undocumented)
    protected readonly decorated: IExecutionFactory;
    // (undocumented)
    forBuckets(buckets: IBucket[], filters?: INullableFilter[]): IPreparedExecution;
    // (undocumented)
    forDefinition(def: IExecutionDefinition): IPreparedExecution;
    // (undocumented)
    forInsight(insight: IInsightDefinition, filters?: INullableFilter[]): IPreparedExecution;
    // (undocumented)
    forInsightByRef(insight: IInsight, filters?: INullableFilter[]): IPreparedExecution;
    // (undocumented)
    forItems(items: IAttributeOrMeasure[], filters?: INullableFilter[]): IPreparedExecution;
    protected wrap: (execution: IPreparedExecution) => IPreparedExecution;
    }

// @alpha
export abstract class DecoratedExecutionResult implements IExecutionResult {
    protected constructor(decorated: IExecutionResult, wrapper?: PreparedExecutionWrapper);
    // (undocumented)
    definition: IExecutionDefinition;
    // (undocumented)
    dimensions: IDimensionDescriptor[];
    // (undocumented)
    equals(other: IExecutionResult): boolean;
    // (undocumented)
    export(options: IExportConfig): Promise<IExportResult>;
    // (undocumented)
    fingerprint(): string;
    // (undocumented)
    readAll(): Promise<IDataView>;
    // (undocumented)
    readWindow(offset: number[], size: number[]): Promise<IDataView>;
    // (undocumented)
    transform(): IPreparedExecution;
    }

// @alpha
export abstract class DecoratedPreparedExecution implements IPreparedExecution {
    protected constructor(decorated: IPreparedExecution);
    protected abstract createNew(decorated: IPreparedExecution): IPreparedExecution;
    // (undocumented)
    protected readonly decorated: IPreparedExecution;
    // (undocumented)
    readonly definition: IExecutionDefinition;
    // (undocumented)
    equals(other: IPreparedExecution): boolean;
    // (undocumented)
    execute(): Promise<IExecutionResult>;
    // (undocumented)
    fingerprint(): string;
    // (undocumented)
    withDateFormat(dateFormat: string): IPreparedExecution;
    // (undocumented)
    withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution;
    // (undocumented)
    withSorting(...items: ISortItem[]): IPreparedExecution;
}

// @alpha (undocumented)
export abstract class DecoratedSecuritySettingsService implements ISecuritySettingsService {
    protected constructor(decorated: ISecuritySettingsService);
    // (undocumented)
    isUrlValid(url: string, context: ValidationContext): Promise<boolean>;
    // (undocumented)
    scope: string;
}

// @alpha (undocumented)
export abstract class DecoratedWorkspaceCatalog implements IWorkspaceCatalog {
    protected constructor(decorated: IWorkspaceCatalog);
    // (undocumented)
    allItems(): CatalogItem[];
    // (undocumented)
    attributes(): ICatalogAttribute[];
    // (undocumented)
    availableItems(): IWorkspaceCatalogAvailableItemsFactory;
    // (undocumented)
    dateDatasets(): ICatalogDateDataset[];
    // (undocumented)
    facts(): ICatalogFact[];
    // (undocumented)
    groups(): ICatalogGroup[];
    // (undocumented)
    measures(): ICatalogMeasure[];
}

// @alpha (undocumented)
export abstract class DecoratedWorkspaceCatalogFactory implements IWorkspaceCatalogFactory {
    protected constructor(decorated: IWorkspaceCatalogFactory, wrapper?: WorkspaceCatalogWrapper);
    protected abstract createNew(decorated: IWorkspaceCatalogFactory): IWorkspaceCatalogFactory;
    // (undocumented)
    excludeTags(tags: ObjRef[]): IWorkspaceCatalogFactory;
    // (undocumented)
    forDataset(dataset: ObjRef): IWorkspaceCatalogFactory;
    // (undocumented)
    forTypes(types: CatalogItemType[]): IWorkspaceCatalogFactory;
    // (undocumented)
    includeTags(tags: ObjRef[]): IWorkspaceCatalogFactory;
    // (undocumented)
    load(): Promise<IWorkspaceCatalog>;
    // (undocumented)
    options: IWorkspaceCatalogFactoryOptions;
    // (undocumented)
    withOptions(options: IWorkspaceCatalogFactoryOptions): IWorkspaceCatalogFactory;
    // (undocumented)
    workspace: string;
    // (undocumented)
    protected readonly wrapper: WorkspaceCatalogWrapper;
}

// @alpha
export type DecoratorFactories = {
    execution?: ExecutionDecoratorFactory;
    catalog?: CatalogDecoratorFactory;
    securitySettings?: SecuritySettingsDecoratorFactory;
};

// @beta (undocumented)
export const DefaultCachingConfiguration: CachingConfiguration;

// @internal (undocumented)
export class Denormalizer {
    denormalizeDimDescriptors: (normalizedDims: IDimensionDescriptor[]) => IDimensionDescriptor[];
    denormalizeHeaders: (headerItems: IResultHeader[][][]) => IResultHeader[][][];
    // (undocumented)
    static from(state: NormalizationState): Denormalizer;
    // (undocumented)
    readonly state: NormalizationState;
}

// @internal
export function dummyBackend(config?: DummyBackendConfig): IAnalyticalBackend;

// @internal (undocumented)
export type DummyBackendConfig = IAnalyticalBackendConfig & {
    raiseNoDataExceptions: boolean;
};

// @internal
export function dummyBackendEmptyData(): IAnalyticalBackend;

// @internal
export function dummyDataView(definition: IExecutionDefinition, result?: IExecutionResult, config?: DummyBackendConfig): IDataView;

// @alpha (undocumented)
export type ExecutionDecoratorFactory = (executionFactory: IExecutionFactory) => IExecutionFactory;

// @internal
export class ExecutionFactoryUpgradingToExecByReference extends DecoratedExecutionFactory {
    constructor(decorated: IExecutionFactory);
    // (undocumented)
    forInsight(insight: IInsightDefinition, filters?: INullableFilter[]): IPreparedExecution;
}

// @internal
export class ExecutionFactoryWithFixedFilters extends DecoratedExecutionFactory {
    constructor(decorated: IExecutionFactory, filters?: INullableFilter[]);
    // (undocumented)
    forBuckets(buckets: IBucket[], filters?: INullableFilter[]): IPreparedExecution;
    // (undocumented)
    forInsight(insight: IInsightDefinition, filters?: INullableFilter[]): IPreparedExecution;
    // (undocumented)
    forInsightByRef(insight: IInsight, filters?: INullableFilter[]): IPreparedExecution;
    // (undocumented)
    forItems(items: IAttributeOrMeasure[], filters?: INullableFilter[]): IPreparedExecution;
}

// @beta
export type ExtractBuilderType<TBuilder> = TBuilder extends IBuilder<infer TItem> ? TItem : never;

// @beta
export class FactMetadataObjectBuilder<T extends IFactMetadataObject = IFactMetadataObject> extends MetadataObjectBuilder<T> {
}

// @beta
export class GroupableCatalogItemBuilder<T extends IGroupableCatalogItemBase = IGroupableCatalogItemBase> extends Builder<T> implements IGroupableCatalogItemBuilder<T> {
    // (undocumented)
    groups(tagRefs: ObjRef[]): this;
}

// @beta
export interface IAuthenticatedAsyncCallContext {
    getPrincipal(): Promise<IAuthenticatedPrincipal>;
}

// @public
export interface IAuthProviderCallGuard extends IAuthenticationProvider {
    // (undocumented)
    reset(): void;
}

// @beta
export interface IBuilder<T> {
    build(): T;
    modify(modifications: BuilderModifications<this, T>): this;
    validate(): this;
}

// @beta
export interface IGroupableCatalogItemBuilder<T extends IGroupableCatalogItemBase = IGroupableCatalogItemBase> extends IBuilder<T> {
    // (undocumented)
    groups(tagRefs: ObjRef[]): this;
}

// @alpha
export interface IInsightWidgetBuilder extends IWidgetBaseBuilder<IInsightWidget> {
    // (undocumented)
    drills(valueOrUpdateCallback: ValueOrUpdateCallback<InsightDrillDefinition[]>): this;
    // (undocumented)
    insight(valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this;
    // (undocumented)
    properties(valueOrUpdateCallback: ValueOrUpdateCallback<VisualizationProperties | undefined>): this;
}

// @alpha
export interface IKpiWidgetBuilder extends IWidgetBaseBuilder<IKpiWidget> {
    // (undocumented)
    comparisonDirection(valueOrUpdateCallback: ValueOrUpdateCallback<ILegacyKpiComparisonDirection | undefined>): this;
    // (undocumented)
    comparisonType(valueOrUpdateCallback: ValueOrUpdateCallback<ILegacyKpiComparisonTypeComparison>): this;
    // (undocumented)
    drills(valueOrUpdateCallback: ValueOrUpdateCallback<KpiDrillDefinition[]>): this;
    // (undocumented)
    measure(valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this;
}

// @beta
export interface IMetadataObjectBuilder<T extends IMetadataObject = IMetadataObject> extends IBuilder<T> {
    deprecated(isDeprecated: boolean): this;
    description(description: string): this;
    id(id: string): this;
    production(isProduction: boolean): this;
    title(title: string): this;
    unlisted(value: boolean): this;
    uri(uri: string): this;
}

// @internal
export class InMemoryPaging<T> implements IPagedResource<T> {
    constructor(all: T[], limit?: number, offset?: number);
    // (undocumented)
    protected readonly all: T[];
    // (undocumented)
    readonly items: T[];
    // (undocumented)
    readonly limit: number;
    // (undocumented)
    next(): Promise<IPagedResource<T>>;
    // (undocumented)
    readonly offset: number;
    // (undocumented)
    readonly totalCount: number;
}

// @alpha (undocumented)
export class InsightWidgetBuilder extends WidgetBaseBuilder<IInsightWidget> implements IInsightWidgetBuilder {
    constructor(item: IInsightWidget, validator?: ((item: Partial<IInsightWidget>) => void) | undefined);
    // (undocumented)
    drills: (valueOrUpdateCallback: ValueOrUpdateCallback<InsightDrillDefinition[]>) => this;
    // (undocumented)
    static for(insightWidget: IInsightWidgetDefinition): InsightWidgetBuilder;
    // (undocumented)
    static forNew(insight: ObjRef): InsightWidgetBuilder;
    // (undocumented)
    insight: (valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>) => this;
    // (undocumented)
    protected item: IInsightWidget;
    // (undocumented)
    properties: (valueOrUpdateCallback: ValueOrUpdateCallback<VisualizationProperties | undefined>) => this;
    // (undocumented)
    protected validator?: ((item: Partial<IInsightWidget>) => void) | undefined;
}

// @alpha
export interface IWidgetBaseBuilder<T extends IWidget> extends IBuilder<T> {
    // (undocumented)
    dateDataSet(valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef | undefined>): this;
    // (undocumented)
    description(valueOrUpdateCallback: ValueOrUpdateCallback<string>): this;
    // (undocumented)
    id(valueOrUpdateCallback: ValueOrUpdateCallback<string>): this;
    // (undocumented)
    ignoreDashboardFilters(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardFilterReference[]>): this;
    // (undocumented)
    ref(valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this;
    // (undocumented)
    title(valueOrUpdateCallback: ValueOrUpdateCallback<string>): this;
    // (undocumented)
    uri(valueOrUpdateCallback: ValueOrUpdateCallback<string>): this;
}

// @alpha (undocumented)
export class KpiWidgetBuilder extends WidgetBaseBuilder<IKpiWidget> implements IKpiWidgetBuilder {
    constructor(item: IKpiWidget, validator?: ((item: Partial<IKpiWidget>) => void) | undefined);
    // (undocumented)
    comparisonDirection: (valueOrUpdateCallback: ValueOrUpdateCallback<ILegacyKpiComparisonDirection | undefined>) => this;
    // (undocumented)
    comparisonType: (valueOrUpdateCallback: ValueOrUpdateCallback<ILegacyKpiComparisonTypeComparison>) => this;
    // (undocumented)
    drills: (valueOrUpdateCallback: ValueOrUpdateCallback<KpiDrillDefinition[]>) => this;
    // (undocumented)
    static for(kpiWidget: IKpiWidgetDefinition): KpiWidgetBuilder;
    // (undocumented)
    static forNew(measure: ObjRef): KpiWidgetBuilder;
    // (undocumented)
    protected item: IKpiWidget;
    // (undocumented)
    measure: (valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>) => this;
    // (undocumented)
    protected setKpiWidgetProp: <K extends "comparisonType" | "comparisonDirection" | "metric">(prop: K, valueOrUpdateCallback: ValueOrUpdateCallback<ILegacyKpi[K]>) => this;
    // (undocumented)
    protected validator?: ((item: Partial<IKpiWidget>) => void) | undefined;
}

// @beta (undocumented)
export type LocalIdMap = {
    [from: string]: string;
};

// @beta
export class MeasureMetadataObjectBuilder<T extends IMeasureMetadataObject = IMeasureMetadataObject> extends MetadataObjectBuilder<T> {
    // (undocumented)
    expression(maql: string): this;
    // (undocumented)
    format(format: string): this;
}

// @beta
export class MetadataObjectBuilder<T extends IMetadataObject = IMetadataObject> extends Builder<T> implements IMetadataObjectBuilder {
    // (undocumented)
    deprecated(isDeprecated: boolean): this;
    // (undocumented)
    description(description: string): this;
    // (undocumented)
    id(identifier: string): this;
    // (undocumented)
    production(isProduction: boolean): this;
    // (undocumented)
    title(title: string): this;
    // (undocumented)
    unlisted(value: boolean): this;
    // (undocumented)
    uri(uri: string): this;
}

// @beta
export const newAttributeDisplayFormMetadataObject: (ref: ObjRef, modifications?: BuilderModifications<AttributeDisplayFormMetadataObjectBuilder>) => IAttributeDisplayFormMetadataObject;

// @beta
export const newAttributeMetadataObject: (ref: ObjRef, modifications?: BuilderModifications<AttributeMetadataObjectBuilder>) => IAttributeMetadataObject;

// @beta
export const newCatalogAttribute: (modifications?: BuilderModifications<CatalogAttributeBuilder>) => ICatalogAttribute;

// @beta
export const newCatalogDateAttribute: (modifications?: BuilderModifications<CatalogDateAttributeBuilder>) => ICatalogDateAttribute;

// @beta
export const newCatalogDateDataset: (modifications?: BuilderModifications<CatalogDateDatasetBuilder>) => ICatalogDateDataset;

// @beta
export const newCatalogFact: (modifications?: BuilderModifications<CatalogFactBuilder>) => ICatalogFact;

// @beta
export const newCatalogGroup: (modifications?: BuilderModifications<CatalogGroupBuilder>) => ICatalogGroup;

// @beta
export const newCatalogMeasure: (modifications?: BuilderModifications<CatalogMeasureBuilder>) => ICatalogMeasure;

// @beta
export const newDashboardMetadataObject: (ref: ObjRef, modifications?: BuilderModifications<DashboardMetadataObjectBuilder>) => IDashboardMetadataObject;

// @beta
export const newDataSetMetadataObject: (ref: ObjRef, modifications?: BuilderModifications<DataSetMetadataObjectBuilder>) => IDataSetMetadataObject;

// @beta
export const newFactMetadataObject: (ref: ObjRef, modifications?: BuilderModifications<FactMetadataObjectBuilder>) => IFactMetadataObject;

// @alpha (undocumented)
export const newInsightWidget: (measure: ObjRef, modifications: (builder: InsightWidgetBuilder) => InsightWidgetBuilder) => IInsightWidget;

// @alpha (undocumented)
export const newKpiWidget: (measure: ObjRef, modifications: (builder: KpiWidgetBuilder) => KpiWidgetBuilder) => IKpiWidget;

// @beta
export const newMeasureMetadataObject: (ref: ObjRef, modifications?: BuilderModifications<MeasureMetadataObjectBuilder>) => IMeasureMetadataObject;

// @beta
export const newVariableMetadataObject: (ref: ObjRef, modifications?: BuilderModifications<VariableMetadataObjectBuilder>) => IVariableMetadataObject;

// @internal
export class NoopAuthProvider implements IAuthProviderCallGuard {
    // (undocumented)
    authenticate(_context: IAuthenticationContext): Promise<IAuthenticatedPrincipal>;
    // (undocumented)
    deauthenticate(_context: IAuthenticationContext): Promise<void>;
    // (undocumented)
    getCurrentPrincipal(_context: IAuthenticationContext): Promise<IAuthenticatedPrincipal | null>;
    // (undocumented)
    reset(): void;
}

// @beta (undocumented)
export type NormalizationConfig = {
    normalizationStatus?: (normalizationState: NormalizationState) => void;
    executeByRefMode?: NormalizationWhenExecuteByRef;
};

// @beta (undocumented)
export type NormalizationState = {
    readonly normalized: IExecutionDefinition;
    readonly original: IExecutionDefinition;
    readonly n2oMap: LocalIdMap;
};

// @beta (undocumented)
export type NormalizationWhenExecuteByRef = "prohibit" | "fallback";

// @internal
export class Normalizer {
    // (undocumented)
    static normalize(def: IExecutionDefinition): NormalizationState;
    // (undocumented)
    readonly normalized: IExecutionDefinition;
    // (undocumented)
    readonly original: IExecutionDefinition;
    }

// @alpha (undocumented)
export type PreparedExecutionWrapper = (execution: IPreparedExecution) => IPreparedExecution;

// @alpha
export const resolveValueOrUpdateCallback: <TValue>(valueOrUpdateCallback: ValueOrUpdateCallback<TValue>, valueToUpdate: TValue) => TValue;

// @beta (undocumented)
export type ResultFactory = (dimensions: IDimensionDescriptor[], fingerprint: string) => IExecutionResult;

// @public (undocumented)
export type ResultHeaderTransformer = (resultHeader: IResultHeader, postProcessing?: IPostProcessing) => IResultHeader;

// @beta (undocumented)
export type ResultProvider = (context: ResultProviderContext) => Promise<IExecutionResult>;

// @beta (undocumented)
export type ResultProviderContext = CustomCallContext & {
    execution: IPreparedExecution;
    resultFactory: ResultFactory;
};

// @alpha (undocumented)
export type SecuritySettingsDecoratorFactory = (securitySettings: ISecuritySettingsService) => ISecuritySettingsService;

// @beta (undocumented)
export type TelemetryData = {
    componentName?: string;
    props?: string[];
};

// @public
export function transformResultHeaders(resultHeaders: IResultHeader[][][], resultHeaderTransformer?: ResultHeaderTransformer, postProcessing?: IPostProcessing): IResultHeader[][][];

// @alpha
export type ValueOrUpdateCallback<TValue> = TValue | ((value: TValue) => TValue);

// @beta
export class VariableMetadataObjectBuilder<T extends IVariableMetadataObject = IVariableMetadataObject> extends MetadataObjectBuilder<T> {
}

// @alpha (undocumented)
export class WidgetBaseBuilder<T extends IWidget> extends Builder<T> implements IWidgetBaseBuilder<T> {
    // (undocumented)
    dateDataSet: (valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef | undefined>) => this;
    // (undocumented)
    description: (valueOrUpdateCallback: ValueOrUpdateCallback<string>) => this;
    // (undocumented)
    id: (valueOrUpdateCallback: ValueOrUpdateCallback<string>) => this;
    // (undocumented)
    ignoreDashboardFilters: (valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardFilterReference[]>) => this;
    // (undocumented)
    ref: (valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>) => this;
    // (undocumented)
    protected setWidget: (updateCallback: (widget: Partial<T>) => Partial<T>) => this;
    // (undocumented)
    protected setWidgetProp: <K extends keyof T>(prop: K, valueOrUpdateCallback: ValueOrUpdateCallback<T[K]>) => this;
    // (undocumented)
    title: (valueOrUpdateCallback: ValueOrUpdateCallback<string>) => this;
    // (undocumented)
    uri: (valueOrUpdateCallback: ValueOrUpdateCallback<string>) => this;
}

// @beta
export function withCaching(realBackend: IAnalyticalBackend, config?: CachingConfiguration): IAnalyticalBackend;

// @beta
export function withEventing(realBackend: IAnalyticalBackend, callbacks: AnalyticalBackendCallbacks): IAnalyticalBackend;

// @beta
export function withNormalization(realBackend: IAnalyticalBackend, config?: NormalizationConfig): IAnalyticalBackend;

// @alpha (undocumented)
export type WorkspaceCatalogWrapper = (catalog: IWorkspaceCatalog) => IWorkspaceCatalog;


// (No @packageDocumentation comment for this package)

```
