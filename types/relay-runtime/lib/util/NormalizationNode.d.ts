export type NormalizationArgument =
  | NormalizationLiteral
  | NormalizationVariable;

export type NormalizationArgumentDefinition =
  | NormalizationLocalArgument
  | NormalizationRootArgument;

export interface NormalizationDefer {
  readonly if: string | null;
  readonly kind: "Defer";
  readonly label: string;
  readonly metadata: { readonly [key: string]: unknown } | null | undefined;
  readonly selections: ReadonlyArray<NormalizationSelection>;
}

export interface NormalizationClientExtension {
  kind: string; // 'ClientExtension';
  selections: ReadonlyArray<NormalizationSelection>;
}

export type NormalizationField =
  | NormalizationScalarField
  | NormalizationLinkedField
  | NormalizationMatchField;

export interface NormalizationLinkedField {
  readonly kind: string; // 'LinkedField';
  readonly alias: string | null | undefined;
  readonly name: string;
  readonly storageKey: string | null | undefined;
  readonly args: ReadonlyArray<NormalizationArgument>;
  readonly concreteType: string | null | undefined;
  readonly plural: boolean;
  readonly selections: ReadonlyArray<NormalizationSelection>;
}

export interface NormalizationMatchField {
  readonly kind: string; // 'MatchField';
  readonly alias: string | null | undefined;
  readonly name: string;
  readonly storageKey: string | null | undefined;
  readonly args: ReadonlyArray<NormalizationArgument>;
  readonly matchesByType: {
    readonly [key: string]: {
      readonly fragmentPropName: string;
      readonly fragmentName: string;
    };
  };
}

export interface NormalizationOperation {
  readonly kind: string; // 'Operation';
  readonly name: string;
  readonly argumentDefinitions: ReadonlyArray<NormalizationLocalArgument>;
  readonly selections: ReadonlyArray<NormalizationSelection>;
}

export interface NormalizationScalarField {
  readonly kind: string; // 'ScalarField';
  readonly alias: string | null | undefined;
  readonly name: string;
  readonly args: ReadonlyArray<NormalizationArgument> | null | undefined;
  readonly storageKey: string | null | undefined;
}

export type NormalizationSelection =
  | NormalizationCondition
  | NormalizationClientExtension
  | NormalizationField
  | NormalizationHandle
  | NormalizationInlineFragment
  | NormalizationMatchField;

export interface NormalizationSplitOperation {
  readonly kind: string; // 'SplitOperation';
  readonly name: string;
  readonly metadata: { readonly [key: string]: unknown } | null | undefined;
  readonly selections: ReadonlyArray<NormalizationSelection>;
}

export interface NormalizationStream {
  readonly if: string | null;
  readonly kind: string; // 'Stream';
  readonly label: string;
  readonly metadata: { readonly [key: string]: unknown } | null | undefined;
  readonly selections: ReadonlyArray<NormalizationSelection>;
}

interface NormalizationLiteral {
  readonly kind: string; // 'Literal';
  readonly name: string;
  readonly type?: string | null;
  readonly value: unknown;
}

interface NormalizationVariable {
  readonly kind: string; // 'Variable';
  readonly name: string;
  readonly type?: string | null;
  readonly variableName: string;
}

interface NormalizationLocalArgument {
  readonly kind: string; // 'LocalArgument';
  readonly name: string;
  readonly type: string;
  readonly defaultValue: unknown;
}

interface NormalizationRootArgument {
  readonly kind: string; // 'RootArgument';
  readonly name: string;
  readonly type: string | null | undefined;
}

interface NormalizationCondition {
  readonly kind: string; // 'Condition';
  readonly passingValue: boolean;
  readonly condition: string;
  readonly selections: ReadonlyArray<NormalizationSelection>;
}

type NormalizationHandle =
  | NormalizationScalarHandle
  | NormalizationLinkedHandle;

interface NormalizationLinkedHandle {
  readonly kind: string; // 'LinkedHandle';
  readonly alias: string | null | undefined;
  readonly name: string;
  readonly args: ReadonlyArray<NormalizationArgument> | null | undefined;
  readonly handle: string;
  readonly key: string;
  readonly filters: ReadonlyArray<string> | null | undefined;
}

interface NormalizationScalarHandle {
  readonly kind: string; // 'ScalarHandle';
  readonly alias: string | null | undefined;
  readonly name: string;
  readonly args: ReadonlyArray<NormalizationArgument> | null | undefined;
  readonly handle: string;
  readonly key: string;
  readonly filters: ReadonlyArray<string> | null | undefined;
}

interface NormalizationInlineFragment {
  readonly kind: string; // 'InlineFragment';
  readonly selections: ReadonlyArray<NormalizationSelection>;
  readonly type: string;
}

type NormalizationSelectableNode =
  | NormalizationDefer
  | NormalizationOperation
  | NormalizationSplitOperation
  | NormalizationStream;
