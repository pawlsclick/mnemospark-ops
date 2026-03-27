/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](https://ecma-international.org/wp-content/uploads/ECMA-404_2nd_edition_december_2017.pdf). */
  JSON: { input: any; output: any; }
};

export type DashboardEvent = {
  __typename?: 'DashboardEvent';
  amount?: Maybe<Scalars['Float']['output']>;
  eventType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  idempotencyKey?: Maybe<Scalars['String']['output']>;
  lambdaName?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  network?: Maybe<Scalars['String']['output']>;
  normalizedReason?: Maybe<Scalars['String']['output']>;
  normalizedStatus?: Maybe<Scalars['String']['output']>;
  objectId?: Maybe<Scalars['String']['output']>;
  objectIdHash?: Maybe<Scalars['String']['output']>;
  objectKey?: Maybe<Scalars['String']['output']>;
  quoteId?: Maybe<Scalars['String']['output']>;
  requestId?: Maybe<Scalars['String']['output']>;
  route?: Maybe<Scalars['String']['output']>;
  severity: Scalars['String']['output'];
  source: Scalars['String']['output'];
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  transId?: Maybe<Scalars['String']['output']>;
  walletAddress?: Maybe<Scalars['String']['output']>;
};

export type DashboardEventFilterInput = {
  lambdaName?: InputMaybe<Scalars['String']['input']>;
  quoteId?: InputMaybe<Scalars['String']['input']>;
  requestId?: InputMaybe<Scalars['String']['input']>;
  route?: InputMaybe<Scalars['String']['input']>;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

export type FunnelMetricsGql = {
  __typename?: 'FunnelMetricsGQL';
  paymentSettled: Scalars['Int']['output'];
  paymentToUploadRate: Scalars['Float']['output'];
  quoteCreated: Scalars['Int']['output'];
  quoteToPaymentRate: Scalars['Float']['output'];
  uploadConfirmed: Scalars['Int']['output'];
  uploadStarted: Scalars['Int']['output'];
  uploadToConfirmRate: Scalars['Float']['output'];
};

export type Health = {
  __typename?: 'Health';
  ok: Scalars['Boolean']['output'];
};

export type HealthScore = {
  __typename?: 'HealthScore';
  errorRate: Scalars['Float']['output'];
  latencyScore: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  successRate: Scalars['Float']['output'];
  throughput: Scalars['Float']['output'];
};

export type LatencyMetrics = {
  __typename?: 'LatencyMetrics';
  paymentToUploadP50: Scalars['Float']['output'];
  paymentToUploadP95: Scalars['Float']['output'];
  quoteToPaymentP50: Scalars['Float']['output'];
  quoteToPaymentP95: Scalars['Float']['output'];
  uploadToConfirmP50: Scalars['Float']['output'];
  uploadToConfirmP95: Scalars['Float']['output'];
};

export type ObjectDuplicate = {
  __typename?: 'ObjectDuplicate';
  objectIdHash: Scalars['String']['output'];
  quoteCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  dashboardEvents: Array<DashboardEvent>;
  eventRatePerMinute: Array<SeriesPoint>;
  failureReasonBreakdown: Array<SeriesPoint>;
  health: Health;
  healthScore: HealthScore;
  idempotencyConflicts: Array<SeriesPoint>;
  lambdaErrorSummary: Array<SeriesPoint>;
  objectDuplicateSummary: Array<ObjectDuplicate>;
  quoteFacts: Array<QuoteFact>;
  quoteFunnel: FunnelMetricsGql;
  quoteLatencyPercentiles: LatencyMetrics;
  revenueSummary: RevenueSummary;
  rootCauseTrace: RootCausePanel;
  statusDistribution: Array<SeriesPoint>;
  traceByQuoteId: Array<DashboardEvent>;
  traceByRequestId: Array<DashboardEvent>;
  walletDetail: WalletDetail;
  walletFacts: Array<WalletFacts>;
};


export type QueryDashboardEventsArgs = {
  filters?: InputMaybe<DashboardEventFilterInput>;
  limit?: Scalars['Int']['input'];
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryEventRatePerMinuteArgs = {
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryFailureReasonBreakdownArgs = {
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryHealthScoreArgs = {
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryIdempotencyConflictsArgs = {
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryLambdaErrorSummaryArgs = {
  limit?: Scalars['Int']['input'];
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryObjectDuplicateSummaryArgs = {
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryQuoteFactsArgs = {
  limit?: Scalars['Int']['input'];
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryQuoteFunnelArgs = {
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryQuoteLatencyPercentilesArgs = {
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryRevenueSummaryArgs = {
  walletAddress: Scalars['String']['input'];
};


export type QueryRootCauseTraceArgs = {
  quoteId?: InputMaybe<Scalars['String']['input']>;
  requestId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStatusDistributionArgs = {
  timeRange?: InputMaybe<TimeRangeInput>;
};


export type QueryTraceByQuoteIdArgs = {
  quoteId: Scalars['String']['input'];
};


export type QueryTraceByRequestIdArgs = {
  requestId: Scalars['String']['input'];
};


export type QueryWalletDetailArgs = {
  timeRange?: InputMaybe<TimeRangeInput>;
  walletAddress: Scalars['String']['input'];
};


export type QueryWalletFactsArgs = {
  limit?: Scalars['Int']['input'];
  timeRange?: InputMaybe<TimeRangeInput>;
};

export type QuoteFact = {
  __typename?: 'QuoteFact';
  amountNormalized?: Maybe<Scalars['Float']['output']>;
  failedStage?: Maybe<Scalars['String']['output']>;
  finalStatus: Scalars['String']['output'];
  firstSeenAt?: Maybe<Scalars['String']['output']>;
  hasFailure: Scalars['Boolean']['output'];
  hasPaymentSettled: Scalars['Boolean']['output'];
  hasQuoteCreated: Scalars['Boolean']['output'];
  hasUploadConfirmed: Scalars['Boolean']['output'];
  hasUploadStarted: Scalars['Boolean']['output'];
  lastSeenAt?: Maybe<Scalars['String']['output']>;
  network?: Maybe<Scalars['String']['output']>;
  objectId?: Maybe<Scalars['String']['output']>;
  objectIdHash?: Maybe<Scalars['String']['output']>;
  objectKey?: Maybe<Scalars['String']['output']>;
  quoteId: Scalars['String']['output'];
  walletAddress?: Maybe<Scalars['String']['output']>;
};

export type RevenueSummary = {
  __typename?: 'RevenueSummary';
  confirmedPaymentCount: Scalars['Int']['output'];
  totalAmount: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
};

export type RootCausePanel = {
  __typename?: 'RootCausePanel';
  firstFailureEvent?: Maybe<DashboardEvent>;
  latestEvent?: Maybe<DashboardEvent>;
  likelyFailedStage?: Maybe<Scalars['String']['output']>;
  likelyFailureCategory?: Maybe<Scalars['String']['output']>;
  relatedEvents: Array<DashboardEvent>;
};

export type SeriesPoint = {
  __typename?: 'SeriesPoint';
  label: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type TimeRangeInput = {
  from?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

export type WalletDetail = {
  __typename?: 'WalletDetail';
  events: Array<DashboardEvent>;
  quotes: Array<QuoteFact>;
  wallet?: Maybe<WalletFacts>;
};

export type WalletFacts = {
  __typename?: 'WalletFacts';
  averageRevenuePerQuote: Scalars['Float']['output'];
  firstSeenAt?: Maybe<Scalars['String']['output']>;
  lastEventType?: Maybe<Scalars['String']['output']>;
  lastNetwork?: Maybe<Scalars['String']['output']>;
  lastSeenAt?: Maybe<Scalars['String']['output']>;
  medianTransactionSize: Scalars['Float']['output'];
  totalAuthFailures: Scalars['Int']['output'];
  totalFailures: Scalars['Int']['output'];
  totalPaymentsSettled: Scalars['Int']['output'];
  totalQuotes: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
  totalUploadsConfirmed: Scalars['Int']['output'];
  totalUploadsStarted: Scalars['Int']['output'];
  walletAddress: Scalars['String']['output'];
};

export type EventsPageQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  filters?: InputMaybe<DashboardEventFilterInput>;
}>;


export type EventsPageQuery = { __typename?: 'Query', dashboardEvents: Array<{ __typename?: 'DashboardEvent', id: string, timestamp: string, walletAddress?: string | null, eventType: string, source: string, route?: string | null, lambdaName?: string | null, status: string, quoteId?: string | null, requestId?: string | null, message: string }> };

export type HealthCheckSidebarQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthCheckSidebarQuery = { __typename?: 'Query', health: { __typename?: 'Health', ok: boolean } };

export type OpsHealthQueryVariables = Exact<{
  timeRange?: InputMaybe<TimeRangeInput>;
}>;


export type OpsHealthQuery = { __typename?: 'Query', healthScore: { __typename?: 'HealthScore', status: string, successRate: number, errorRate: number, throughput: number, latencyScore: number }, quoteLatencyPercentiles: { __typename?: 'LatencyMetrics', quoteToPaymentP50: number, quoteToPaymentP95: number, paymentToUploadP50: number, paymentToUploadP95: number, uploadToConfirmP50: number, uploadToConfirmP95: number } };

export type OpsFailuresQueryVariables = Exact<{
  timeRange?: InputMaybe<TimeRangeInput>;
}>;


export type OpsFailuresQuery = { __typename?: 'Query', failureReasonBreakdown: Array<{ __typename?: 'SeriesPoint', label: string, value: number }>, dashboardEvents: Array<{ __typename?: 'DashboardEvent', id: string, timestamp: string, eventType: string, source: string, route?: string | null, lambdaName?: string | null, status: string, message: string, walletAddress?: string | null, quoteId?: string | null, requestId?: string | null, normalizedReason?: string | null, normalizedStatus?: string | null }> };

export type OpsLambdasQueryVariables = Exact<{
  timeRange?: InputMaybe<TimeRangeInput>;
}>;


export type OpsLambdasQuery = { __typename?: 'Query', lambdaErrorSummary: Array<{ __typename?: 'SeriesPoint', label: string, value: number }>, eventRatePerMinute: Array<{ __typename?: 'SeriesPoint', label: string, value: number }> };

export type RootCauseTraceQueryVariables = Exact<{
  quoteId?: InputMaybe<Scalars['String']['input']>;
  requestId?: InputMaybe<Scalars['String']['input']>;
}>;


export type RootCauseTraceQuery = { __typename?: 'Query', rootCauseTrace: { __typename?: 'RootCausePanel', likelyFailureCategory?: string | null, likelyFailedStage?: string | null, latestEvent?: { __typename?: 'DashboardEvent', id: string, timestamp: string, message: string, status: string, eventType: string, source: string, route?: string | null, quoteId?: string | null, requestId?: string | null, normalizedReason?: string | null } | null, firstFailureEvent?: { __typename?: 'DashboardEvent', id: string, timestamp: string, message: string, eventType: string, source: string, route?: string | null, quoteId?: string | null, requestId?: string | null, normalizedReason?: string | null } | null, relatedEvents: Array<{ __typename?: 'DashboardEvent', id: string, timestamp: string, eventType: string, message: string, status: string, route?: string | null, quoteId?: string | null, requestId?: string | null, normalizedReason?: string | null }> } };

export type RevenueOverviewQueryVariables = Exact<{
  walletAddress: Scalars['String']['input'];
}>;


export type RevenueOverviewQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', walletAddress: string, confirmedPaymentCount: number, totalAmount: string }, wdQuotes: { __typename?: 'WalletDetail', quotes: Array<{ __typename?: 'QuoteFact', hasPaymentSettled: boolean, amountNormalized?: number | null, lastSeenAt?: string | null }> } };

export type SalesRevenueQueryVariables = Exact<{
  wallet: Scalars['String']['input'];
  limit: Scalars['Int']['input'];
}>;


export type SalesRevenueQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', walletAddress: string, confirmedPaymentCount: number, totalAmount: string }, walletFacts: Array<{ __typename?: 'WalletFacts', walletAddress: string, totalRevenue: number, totalQuotes: number }>, wdQuotes: { __typename?: 'WalletDetail', quotes: Array<{ __typename?: 'QuoteFact', hasPaymentSettled: boolean, amountNormalized?: number | null, lastSeenAt?: string | null }> } };

export type SalesFunnelQueryVariables = Exact<{ [key: string]: never; }>;


export type SalesFunnelQuery = { __typename?: 'Query', quoteFunnel: { __typename?: 'FunnelMetricsGQL', quoteCreated: number, paymentSettled: number, uploadStarted: number, uploadConfirmed: number, quoteToPaymentRate: number, paymentToUploadRate: number, uploadToConfirmRate: number } };

export type SalesWalletsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
}>;


export type SalesWalletsQuery = { __typename?: 'Query', walletFacts: Array<{ __typename?: 'WalletFacts', walletAddress: string, totalRevenue: number, totalQuotes: number, medianTransactionSize: number, firstSeenAt?: string | null, lastSeenAt?: string | null }> };

export type TransactionsPageQueryVariables = Exact<{ [key: string]: never; }>;


export type TransactionsPageQuery = { __typename?: 'Query', quoteFacts: Array<{ __typename?: 'QuoteFact', quoteId: string, walletAddress?: string | null, finalStatus: string, lastSeenAt?: string | null, hasPaymentSettled: boolean, hasUploadConfirmed: boolean, hasFailure: boolean, failedStage?: string | null }>, statusDistribution: Array<{ __typename?: 'SeriesPoint', label: string, value: number }>, objectDuplicateSummary: Array<{ __typename?: 'ObjectDuplicate', objectIdHash: string, quoteCount: number }> };

export type WalletDetailQueryVariables = Exact<{
  walletAddress: Scalars['String']['input'];
}>;


export type WalletDetailQuery = { __typename?: 'Query', walletDetail: { __typename?: 'WalletDetail', wallet?: { __typename?: 'WalletFacts', walletAddress: string, totalRevenue: number, totalQuotes: number, totalPaymentsSettled: number, totalUploadsConfirmed: number, totalFailures: number } | null, quotes: Array<{ __typename?: 'QuoteFact', quoteId: string, finalStatus: string, lastSeenAt?: string | null, hasPaymentSettled: boolean, hasUploadConfirmed: boolean, hasFailure: boolean, failedStage?: string | null }>, events: Array<{ __typename?: 'DashboardEvent', id: string, timestamp: string, eventType: string, source: string, status: string, message: string, quoteId?: string | null, requestId?: string | null }> } };

export type WalletFactsPageQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
}>;


export type WalletFactsPageQuery = { __typename?: 'Query', walletFacts: Array<{ __typename?: 'WalletFacts', walletAddress: string, totalRevenue: number, totalQuotes: number, medianTransactionSize: number, lastSeenAt?: string | null, firstSeenAt?: string | null }> };


export const EventsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventsPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DashboardEventFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboardEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"walletAddress"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"lambdaName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<EventsPageQuery, EventsPageQueryVariables>;
export const HealthCheckSidebarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HealthCheckSidebar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}}]}}]} as unknown as DocumentNode<HealthCheckSidebarQuery, HealthCheckSidebarQueryVariables>;
export const OpsHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OpsHealth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeRangeInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"healthScore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"timeRange"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"successRate"}},{"kind":"Field","name":{"kind":"Name","value":"errorRate"}},{"kind":"Field","name":{"kind":"Name","value":"throughput"}},{"kind":"Field","name":{"kind":"Name","value":"latencyScore"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quoteLatencyPercentiles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"timeRange"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quoteToPaymentP50"}},{"kind":"Field","name":{"kind":"Name","value":"quoteToPaymentP95"}},{"kind":"Field","name":{"kind":"Name","value":"paymentToUploadP50"}},{"kind":"Field","name":{"kind":"Name","value":"paymentToUploadP95"}},{"kind":"Field","name":{"kind":"Name","value":"uploadToConfirmP50"}},{"kind":"Field","name":{"kind":"Name","value":"uploadToConfirmP95"}}]}}]}}]} as unknown as DocumentNode<OpsHealthQuery, OpsHealthQueryVariables>;
export const OpsFailuresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OpsFailures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeRangeInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"failureReasonBreakdown"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"timeRange"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dashboardEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"timeRange"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"400"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"lambdaName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"walletAddress"}},{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"normalizedReason"}},{"kind":"Field","name":{"kind":"Name","value":"normalizedStatus"}}]}}]}}]} as unknown as DocumentNode<OpsFailuresQuery, OpsFailuresQueryVariables>;
export const OpsLambdasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OpsLambdas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeRangeInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lambdaErrorSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"timeRange"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"40"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"eventRatePerMinute"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"timeRange"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<OpsLambdasQuery, OpsLambdasQueryVariables>;
export const RootCauseTraceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCauseTrace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quoteId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rootCauseTrace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"quoteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quoteId"}}},{"kind":"Argument","name":{"kind":"Name","value":"requestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"likelyFailureCategory"}},{"kind":"Field","name":{"kind":"Name","value":"likelyFailedStage"}},{"kind":"Field","name":{"kind":"Name","value":"latestEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"normalizedReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"firstFailureEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"normalizedReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"relatedEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"normalizedReason"}}]}}]}}]}}]} as unknown as DocumentNode<RootCauseTraceQuery, RootCauseTraceQueryVariables>;
export const RevenueOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RevenueOverview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"walletAddress"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revenueSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"walletAddress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"walletAddress"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletAddress"}},{"kind":"Field","name":{"kind":"Name","value":"confirmedPaymentCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"wdQuotes"},"name":{"kind":"Name","value":"walletDetail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"walletAddress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"walletAddress"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quotes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasPaymentSettled"}},{"kind":"Field","name":{"kind":"Name","value":"amountNormalized"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}}]}}]}}]}}]} as unknown as DocumentNode<RevenueOverviewQuery, RevenueOverviewQueryVariables>;
export const SalesRevenueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRevenue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"wallet"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revenueSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"walletAddress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"wallet"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletAddress"}},{"kind":"Field","name":{"kind":"Name","value":"confirmedPaymentCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"walletFacts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletAddress"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuotes"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"wdQuotes"},"name":{"kind":"Name","value":"walletDetail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"walletAddress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"wallet"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quotes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasPaymentSettled"}},{"kind":"Field","name":{"kind":"Name","value":"amountNormalized"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRevenueQuery, SalesRevenueQueryVariables>;
export const SalesFunnelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesFunnel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quoteFunnel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quoteCreated"}},{"kind":"Field","name":{"kind":"Name","value":"paymentSettled"}},{"kind":"Field","name":{"kind":"Name","value":"uploadStarted"}},{"kind":"Field","name":{"kind":"Name","value":"uploadConfirmed"}},{"kind":"Field","name":{"kind":"Name","value":"quoteToPaymentRate"}},{"kind":"Field","name":{"kind":"Name","value":"paymentToUploadRate"}},{"kind":"Field","name":{"kind":"Name","value":"uploadToConfirmRate"}}]}}]}}]} as unknown as DocumentNode<SalesFunnelQuery, SalesFunnelQueryVariables>;
export const SalesWalletsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesWallets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletFacts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletAddress"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuotes"}},{"kind":"Field","name":{"kind":"Name","value":"medianTransactionSize"}},{"kind":"Field","name":{"kind":"Name","value":"firstSeenAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}}]}}]}}]} as unknown as DocumentNode<SalesWalletsQuery, SalesWalletsQueryVariables>;
export const TransactionsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TransactionsPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quoteFacts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"500"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"walletAddress"}},{"kind":"Field","name":{"kind":"Name","value":"finalStatus"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}},{"kind":"Field","name":{"kind":"Name","value":"hasPaymentSettled"}},{"kind":"Field","name":{"kind":"Name","value":"hasUploadConfirmed"}},{"kind":"Field","name":{"kind":"Name","value":"hasFailure"}},{"kind":"Field","name":{"kind":"Name","value":"failedStage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusDistribution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectDuplicateSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objectIdHash"}},{"kind":"Field","name":{"kind":"Name","value":"quoteCount"}}]}}]}}]} as unknown as DocumentNode<TransactionsPageQuery, TransactionsPageQueryVariables>;
export const WalletDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WalletDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"walletAddress"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletDetail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"walletAddress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"walletAddress"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletAddress"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuotes"}},{"kind":"Field","name":{"kind":"Name","value":"totalPaymentsSettled"}},{"kind":"Field","name":{"kind":"Name","value":"totalUploadsConfirmed"}},{"kind":"Field","name":{"kind":"Name","value":"totalFailures"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quotes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"finalStatus"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}},{"kind":"Field","name":{"kind":"Name","value":"hasPaymentSettled"}},{"kind":"Field","name":{"kind":"Name","value":"hasUploadConfirmed"}},{"kind":"Field","name":{"kind":"Name","value":"hasFailure"}},{"kind":"Field","name":{"kind":"Name","value":"failedStage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}}]}}]}}]}}]} as unknown as DocumentNode<WalletDetailQuery, WalletDetailQueryVariables>;
export const WalletFactsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WalletFactsPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletFacts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletAddress"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuotes"}},{"kind":"Field","name":{"kind":"Name","value":"medianTransactionSize"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstSeenAt"}}]}}]}}]} as unknown as DocumentNode<WalletFactsPageQuery, WalletFactsPageQueryVariables>;