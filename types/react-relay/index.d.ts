// Type definitions for react-relay 1.3
// Project: https://github.com/facebook/relay
// Definitions by: Johannes Schickling <https://github.com/graphcool>
//                 Matt Martin <https://github.com/voxmatt>
//                 Eloy Durán <https://github.com/alloy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.4

export {
    commitLocalUpdate,
    commitRelayModernMutation as commitMutation,
    fetchRelayModernQuery as fetchQuery,
    requestRelaySubscription as requestSubscription,
} from "relay-runtime";

import * as React from "react";
import * as RelayRuntimeTypes from "relay-runtime";

// ~~~~~~~~~~~~~~~~~~~~~
// Maybe Fix
// ~~~~~~~~~~~~~~~~~~~~~
export type ConcreteBatch = any;
export type ConcreteFragmentDefinition = object;
export type ConcreteOperationDefinition = object;

// ~~~~~~~~~~~~~~~~~~~~~
// RelayProp
// ~~~~~~~~~~~~~~~~~~~~~
// note: refetch and pagination containers augment this
export interface RelayProp {
    environment: RelayRuntimeTypes.Environment;
}

// ~~~~~~~~~~~~~~~~~~~~~
// RelayQL
// ~~~~~~~~~~~~~~~~~~~~~
export function RelayQL(strings: string[], ...substitutions: any[]): RelayRuntimeTypes.RelayConcreteNode;

// ~~~~~~~~~~~~~~~~~~~~~
// RelayModernGraphQLTag
// ~~~~~~~~~~~~~~~~~~~~~
export interface GeneratedNodeMap {
    [key: string]: GraphQLTaggedNode;
}
export type GraphQLTaggedNode =
    | (() => RelayRuntimeTypes.ConcreteFragment | ConcreteBatch)
    | {
          modern(): RelayRuntimeTypes.ConcreteFragment | ConcreteBatch;
          classic(relayQL: typeof RelayQL): ConcreteFragmentDefinition | ConcreteOperationDefinition;
      };
/**
 * Runtime function to correspond to the `graphql` tagged template function.
 * All calls to this function should be transformed by the plugin.
 */
export interface GraphqlInterface {
    (strings: string[] | TemplateStringsArray): GraphQLTaggedNode;
    experimental(strings: string[] | TemplateStringsArray): GraphQLTaggedNode;
}
export const graphql: GraphqlInterface;

// ~~~~~~~~~~~~~~~~~~~~~
// ReactRelayQueryRenderer
// ~~~~~~~~~~~~~~~~~~~~~
export interface QueryRendererProps {
    cacheConfig?: RelayRuntimeTypes.CacheConfig;
    environment: RelayRuntimeTypes.Environment;
    query: GraphQLTaggedNode;
    render(readyState: ReadyState): React.ReactElement<any> | undefined | null;
    variables: RelayRuntimeTypes.Variables;
    rerunParamExperimental?: RelayRuntimeTypes.RerunParam;
}
export interface ReadyState {
    error: Error | undefined | null;
    props: { [propName: string]: any } | undefined | null;
    retry?(): void;
}
export interface QueryRendererState {
    readyState: ReadyState;
}
export class ReactRelayQueryRenderer extends React.Component<QueryRendererProps, QueryRendererState> {}
export class QueryRenderer extends ReactRelayQueryRenderer {}

// ~~~~~~~~~~~~~~~~~~~~~
// Container utilities
// ~~~~~~~~~~~~~~~~~~~~~

type AnyRelayProp = { relay: any };

// These get emitted by relay-compiler
export interface AbstractFragment {
    __fragments: AbstractFragment;
}

// Turn all the properties in `F` to be of type `AbstractFragment` or `AbstractFragment[]` for @relay(plural: true)
type AbstractFragments<F extends GeneratedNodeMap> = { [P in keyof F]: AbstractFragment | ReadonlyArray<AbstractFragment> }

// Taken from https://github.com/pelotom/type-zoo
type Diff<T extends string, U extends string> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T]
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>
type Overwrite<T, U> = Omit<T, Diff<keyof T, Diff<keyof T, keyof U>>> & U

// Remove a RelayProp/RelayRefetchProp/RelayPaginationProp
type OmitRelayProp<P extends AnyRelayProp> = Omit<P, "relay">;

// Turn all properties in P that exist in `F` to abstract fragments
type OmitFragmentProps<P, F extends GeneratedNodeMap> = Overwrite<P, AbstractFragments<F>>

// ~~~~~~~~~~~~~~~~~~~~~
// Container types
// ~~~~~~~~~~~~~~~~~~~~~

type ContainerWithFragmentAndRelayProps<P extends AnyRelayProp, F extends GeneratedNodeMap> =
    React.ComponentType<OmitFragmentProps<OmitRelayProp<P>, F>>;

type ContainerWithFragmentProps<P, F extends GeneratedNodeMap> =
    React.ComponentType<OmitFragmentProps<P, F>>;

type ContainerWithRelayProp<P extends AnyRelayProp> =
    React.ComponentType<OmitRelayProp<P>>;

type Container<P> =
    React.ComponentType<P>;

// ~~~~~~~~~~~~~~~~~~~~~
// createFragmentContainer
// ~~~~~~~~~~~~~~~~~~~~~

export function createFragmentContainer<P extends AnyRelayProp, F extends GeneratedNodeMap>(
    Component: React.ComponentType<P>,
    fragmentSpec: F
): ContainerWithFragmentAndRelayProps<P, F>

export function createFragmentContainer<P, F extends GeneratedNodeMap>(
    Component: React.ComponentType<P>,
    fragmentSpec: F
): ContainerWithFragmentProps<P, F>

export function createFragmentContainer<P extends AnyRelayProp>(
    Component: React.ComponentType<P>,
    fragmentSpec: GraphQLTaggedNode
): ContainerWithRelayProp<P>;

export function createFragmentContainer<P>(
    Component: React.ComponentType<P>,
    fragmentSpec: GraphQLTaggedNode
): Container<P>;

// ~~~~~~~~~~~~~~~~~~~~~
// createPaginationContainer
// ~~~~~~~~~~~~~~~~~~~~~
export interface PageInfo {
    endCursor: string | undefined | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | undefined | null;
}
export interface ConnectionData {
    edges?: any[];
    pageInfo?: PageInfo;
}
export type RelayPaginationProp = RelayProp & {
    hasMore(): boolean;
    isLoading(): boolean;
    loadMore(
        pageSize: number,
        callback: (error?: Error) => void,
        options?: RefetchOptions
    ): RelayRuntimeTypes.Disposable | undefined | null;
    refetchConnection(
        totalCount: number,
        callback: (error?: Error) => void,
        refetchVariables?: RelayRuntimeTypes.Variables
    ): RelayRuntimeTypes.Disposable | undefined | null;
};
export function FragmentVariablesGetter(
    prevVars: RelayRuntimeTypes.Variables,
    totalCount: number
): RelayRuntimeTypes.Variables;
export interface ConnectionConfig<T> {
    direction?: "backward" | "forward";
    getConnectionFromProps?(props: T): ConnectionData | undefined | null;
    getFragmentVariables?: typeof FragmentVariablesGetter;
    getVariables(
        props: { [propName: string]: any },
        paginationInfo: { count: number; cursor?: string },
        fragmentVariables: RelayRuntimeTypes.Variables
    ): RelayRuntimeTypes.Variables;
    query: GraphQLTaggedNode;
}

export function createPaginationContainer<P extends AnyRelayProp, F extends GeneratedNodeMap>(
    Component: React.ComponentType<P>,
    fragmentSpec: F,
    connectionConfig: ConnectionConfig<P>
): ContainerWithFragmentAndRelayProps<P, F>;

export function createPaginationContainer<P, F extends GeneratedNodeMap>(
    Component: React.ComponentType<P>,
    fragmentSpec: F,
    connectionConfig: ConnectionConfig<P>
): ContainerWithFragmentProps<P, F>;

export function createPaginationContainer<P extends AnyRelayProp>(
    Component: React.ComponentType<P>,
    fragmentSpec: GraphQLTaggedNode,
    connectionConfig: ConnectionConfig<P>
): ContainerWithRelayProp<P>;

export function createPaginationContainer<P>(
    Component: React.ComponentType<P>,
    fragmentSpec: GraphQLTaggedNode,
    connectionConfig: ConnectionConfig<P>
): Container<P>;

// ~~~~~~~~~~~~~~~~~~~~~
// createRefetchContainer
// ~~~~~~~~~~~~~~~~~~~~~

export interface RefetchOptions {
    force?: boolean;
    rerunParamExperimental?: RelayRuntimeTypes.RerunParam;
}

export type RelayRefetchProp = RelayProp & {
    refetch(
        refetchVariables:
            | RelayRuntimeTypes.Variables
            | ((fragmentVariables: RelayRuntimeTypes.Variables) => RelayRuntimeTypes.Variables),
        renderVariables?: RelayRuntimeTypes.Variables,
        callback?: (error?: Error) => void,
        options?: RefetchOptions
    ): RelayRuntimeTypes.Disposable;
};

export function createRefetchContainer<P extends AnyRelayProp, F extends GeneratedNodeMap>(
    Component: React.ComponentType<P>,
    fragmentSpec: F,
    taggedNode: GraphQLTaggedNode
): ContainerWithFragmentAndRelayProps<P, F>;

export function createRefetchContainer<P, F extends GeneratedNodeMap>(
    Component: React.ComponentType<P>,
    fragmentSpec: F,
    taggedNode: GraphQLTaggedNode
): ContainerWithFragmentProps<P, F>;

export function createRefetchContainer<P extends AnyRelayProp>(
    Component: React.ComponentType<P>,
    fragmentSpec: GraphQLTaggedNode,
    taggedNode: GraphQLTaggedNode
): ContainerWithRelayProp<P>;

export function createRefetchContainer<P>(
    Component: React.ComponentType<P>,
    fragmentSpec: GraphQLTaggedNode,
    taggedNode: GraphQLTaggedNode
): Container<P>;
