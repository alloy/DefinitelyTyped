import {
  DataID,
  RecordSourceProxy,
  RecordProxy,
  Variables,
  HandleFieldPayload,
  ReadonlyRecordProxy
} from "relay-runtime";

export interface ConnectionMetadata {
  path: ReadonlyArray<string> | null | undefined;
  direction: string | null | undefined; // 'forward' | 'backward' | 'bidirectional' | null | undefined;
  cursor: string | null | undefined;
  count: string | null | undefined;
}

export interface EdgeRecord extends Record<string, unknown> {
  cursor: unknown;
  node: Record<DataID, unknown>;
}

export interface PageInfo {
  endCursor: string | null | undefined;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null | undefined;
}

export interface RelayConnectionHandler {
  buildConnectionEdge(
    store: RecordSourceProxy,
    connection: RecordProxy,
    edge: RecordProxy | null | undefined
  ): RecordProxy | null | undefined;
  createEdge(
    store: RecordSourceProxy,
    record: RecordProxy,
    node: RecordProxy,
    edgeType: string
  ): RecordProxy;
  deleteNode(record: RecordProxy, nodeID: DataID): void;
  getConnection(
    record: ReadonlyRecordProxy,
    key: string,
    filters?: Variables | null
  ): RecordProxy | null | undefined;
  insertEdgeAfter(
    record: RecordProxy,
    newEdge: RecordProxy,
    cursor?: string | null
  ): void;
  insertEdgeBefore(
    record: RecordProxy,
    newEdge: RecordProxy,
    cursor?: string | null
  ): void;
  update(store: RecordSourceProxy, payload: HandleFieldPayload): void;
}
