/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query EventsPage($limit: Int!, $filters: DashboardEventFilterInput) {\n    dashboardEvents(limit: $limit, filters: $filters) {\n      id\n      timestamp\n      walletAddress\n      eventType\n      source\n      route\n      lambdaName\n      status\n      quoteId\n      requestId\n      message\n    }\n  }\n": typeof types.EventsPageDocument,
    "\n  query OpsHealth {\n    healthScore {\n      status\n      successRate\n      errorRate\n      throughput\n      latencyScore\n    }\n    quoteLatencyPercentiles {\n      quoteToPaymentP50\n      quoteToPaymentP95\n      paymentToUploadP50\n      paymentToUploadP95\n      uploadToConfirmP50\n      uploadToConfirmP95\n    }\n  }\n": typeof types.OpsHealthDocument,
    "\n  query OpsFailures {\n    failureReasonBreakdown {\n      label\n      value\n    }\n    dashboardEvents(limit: 400) {\n      id\n      timestamp\n      eventType\n      source\n      status\n      message\n      walletAddress\n    }\n  }\n": typeof types.OpsFailuresDocument,
    "\n  query OpsLambdas {\n    lambdaErrorSummary(limit: 40) {\n      label\n      value\n    }\n    eventRatePerMinute {\n      label\n      value\n    }\n  }\n": typeof types.OpsLambdasDocument,
    "\n  query RootCauseTrace($quoteId: String, $requestId: String) {\n    rootCauseTrace(quoteId: $quoteId, requestId: $requestId) {\n      likelyFailureCategory\n      likelyFailedStage\n      latestEvent {\n        id\n        timestamp\n        message\n        status\n      }\n      firstFailureEvent {\n        id\n        timestamp\n        message\n      }\n      relatedEvents {\n        id\n        timestamp\n        eventType\n        message\n        status\n      }\n    }\n  }\n": typeof types.RootCauseTraceDocument,
    "\n  query HealthCheck {\n    health {\n      ok\n    }\n  }\n": typeof types.HealthCheckDocument,
    "\n  query RevenueOverview($walletAddress: String!) {\n    revenueSummary(walletAddress: $walletAddress) {\n      walletAddress\n      confirmedPaymentCount\n      totalAmount\n    }\n  }\n": typeof types.RevenueOverviewDocument,
    "\n  query SalesRevenue($wallet: String!, $limit: Int!) {\n    revenueSummary(walletAddress: $wallet) {\n      walletAddress\n      confirmedPaymentCount\n      totalAmount\n    }\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n    }\n  }\n": typeof types.SalesRevenueDocument,
    "\n  query SalesFunnel {\n    quoteFunnel {\n      quoteCreated\n      paymentSettled\n      uploadStarted\n      uploadConfirmed\n      quoteToPaymentRate\n      paymentToUploadRate\n      uploadToConfirmRate\n    }\n  }\n": typeof types.SalesFunnelDocument,
    "\n  query SalesWallets($limit: Int!) {\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n      medianTransactionSize\n      firstSeenAt\n      lastSeenAt\n    }\n  }\n": typeof types.SalesWalletsDocument,
    "\n  query TransactionsPage {\n    quoteFacts(limit: 500) {\n      quoteId\n      walletAddress\n      finalStatus\n      lastSeenAt\n      hasPaymentSettled\n      hasUploadConfirmed\n    }\n    statusDistribution {\n      label\n      value\n    }\n    objectDuplicateSummary {\n      objectIdHash\n      quoteCount\n    }\n  }\n": typeof types.TransactionsPageDocument,
    "\n  query WalletDetail($walletAddress: String!) {\n    walletDetail(walletAddress: $walletAddress) {\n      wallet {\n        walletAddress\n        totalRevenue\n        totalQuotes\n        totalPaymentsSettled\n        totalUploadsConfirmed\n        totalFailures\n      }\n      quotes {\n        quoteId\n        finalStatus\n        lastSeenAt\n        hasPaymentSettled\n        hasUploadConfirmed\n      }\n      events {\n        id\n        timestamp\n        eventType\n        source\n        status\n        message\n      }\n    }\n  }\n": typeof types.WalletDetailDocument,
    "\n  query WalletFactsPage($limit: Int!) {\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n      medianTransactionSize\n      lastSeenAt\n      firstSeenAt\n    }\n  }\n": typeof types.WalletFactsPageDocument,
};
const documents: Documents = {
    "\n  query EventsPage($limit: Int!, $filters: DashboardEventFilterInput) {\n    dashboardEvents(limit: $limit, filters: $filters) {\n      id\n      timestamp\n      walletAddress\n      eventType\n      source\n      route\n      lambdaName\n      status\n      quoteId\n      requestId\n      message\n    }\n  }\n": types.EventsPageDocument,
    "\n  query OpsHealth {\n    healthScore {\n      status\n      successRate\n      errorRate\n      throughput\n      latencyScore\n    }\n    quoteLatencyPercentiles {\n      quoteToPaymentP50\n      quoteToPaymentP95\n      paymentToUploadP50\n      paymentToUploadP95\n      uploadToConfirmP50\n      uploadToConfirmP95\n    }\n  }\n": types.OpsHealthDocument,
    "\n  query OpsFailures {\n    failureReasonBreakdown {\n      label\n      value\n    }\n    dashboardEvents(limit: 400) {\n      id\n      timestamp\n      eventType\n      source\n      status\n      message\n      walletAddress\n    }\n  }\n": types.OpsFailuresDocument,
    "\n  query OpsLambdas {\n    lambdaErrorSummary(limit: 40) {\n      label\n      value\n    }\n    eventRatePerMinute {\n      label\n      value\n    }\n  }\n": types.OpsLambdasDocument,
    "\n  query RootCauseTrace($quoteId: String, $requestId: String) {\n    rootCauseTrace(quoteId: $quoteId, requestId: $requestId) {\n      likelyFailureCategory\n      likelyFailedStage\n      latestEvent {\n        id\n        timestamp\n        message\n        status\n      }\n      firstFailureEvent {\n        id\n        timestamp\n        message\n      }\n      relatedEvents {\n        id\n        timestamp\n        eventType\n        message\n        status\n      }\n    }\n  }\n": types.RootCauseTraceDocument,
    "\n  query HealthCheck {\n    health {\n      ok\n    }\n  }\n": types.HealthCheckDocument,
    "\n  query RevenueOverview($walletAddress: String!) {\n    revenueSummary(walletAddress: $walletAddress) {\n      walletAddress\n      confirmedPaymentCount\n      totalAmount\n    }\n  }\n": types.RevenueOverviewDocument,
    "\n  query SalesRevenue($wallet: String!, $limit: Int!) {\n    revenueSummary(walletAddress: $wallet) {\n      walletAddress\n      confirmedPaymentCount\n      totalAmount\n    }\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n    }\n  }\n": types.SalesRevenueDocument,
    "\n  query SalesFunnel {\n    quoteFunnel {\n      quoteCreated\n      paymentSettled\n      uploadStarted\n      uploadConfirmed\n      quoteToPaymentRate\n      paymentToUploadRate\n      uploadToConfirmRate\n    }\n  }\n": types.SalesFunnelDocument,
    "\n  query SalesWallets($limit: Int!) {\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n      medianTransactionSize\n      firstSeenAt\n      lastSeenAt\n    }\n  }\n": types.SalesWalletsDocument,
    "\n  query TransactionsPage {\n    quoteFacts(limit: 500) {\n      quoteId\n      walletAddress\n      finalStatus\n      lastSeenAt\n      hasPaymentSettled\n      hasUploadConfirmed\n    }\n    statusDistribution {\n      label\n      value\n    }\n    objectDuplicateSummary {\n      objectIdHash\n      quoteCount\n    }\n  }\n": types.TransactionsPageDocument,
    "\n  query WalletDetail($walletAddress: String!) {\n    walletDetail(walletAddress: $walletAddress) {\n      wallet {\n        walletAddress\n        totalRevenue\n        totalQuotes\n        totalPaymentsSettled\n        totalUploadsConfirmed\n        totalFailures\n      }\n      quotes {\n        quoteId\n        finalStatus\n        lastSeenAt\n        hasPaymentSettled\n        hasUploadConfirmed\n      }\n      events {\n        id\n        timestamp\n        eventType\n        source\n        status\n        message\n      }\n    }\n  }\n": types.WalletDetailDocument,
    "\n  query WalletFactsPage($limit: Int!) {\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n      medianTransactionSize\n      lastSeenAt\n      firstSeenAt\n    }\n  }\n": types.WalletFactsPageDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventsPage($limit: Int!, $filters: DashboardEventFilterInput) {\n    dashboardEvents(limit: $limit, filters: $filters) {\n      id\n      timestamp\n      walletAddress\n      eventType\n      source\n      route\n      lambdaName\n      status\n      quoteId\n      requestId\n      message\n    }\n  }\n"): (typeof documents)["\n  query EventsPage($limit: Int!, $filters: DashboardEventFilterInput) {\n    dashboardEvents(limit: $limit, filters: $filters) {\n      id\n      timestamp\n      walletAddress\n      eventType\n      source\n      route\n      lambdaName\n      status\n      quoteId\n      requestId\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query OpsHealth {\n    healthScore {\n      status\n      successRate\n      errorRate\n      throughput\n      latencyScore\n    }\n    quoteLatencyPercentiles {\n      quoteToPaymentP50\n      quoteToPaymentP95\n      paymentToUploadP50\n      paymentToUploadP95\n      uploadToConfirmP50\n      uploadToConfirmP95\n    }\n  }\n"): (typeof documents)["\n  query OpsHealth {\n    healthScore {\n      status\n      successRate\n      errorRate\n      throughput\n      latencyScore\n    }\n    quoteLatencyPercentiles {\n      quoteToPaymentP50\n      quoteToPaymentP95\n      paymentToUploadP50\n      paymentToUploadP95\n      uploadToConfirmP50\n      uploadToConfirmP95\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query OpsFailures {\n    failureReasonBreakdown {\n      label\n      value\n    }\n    dashboardEvents(limit: 400) {\n      id\n      timestamp\n      eventType\n      source\n      status\n      message\n      walletAddress\n    }\n  }\n"): (typeof documents)["\n  query OpsFailures {\n    failureReasonBreakdown {\n      label\n      value\n    }\n    dashboardEvents(limit: 400) {\n      id\n      timestamp\n      eventType\n      source\n      status\n      message\n      walletAddress\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query OpsLambdas {\n    lambdaErrorSummary(limit: 40) {\n      label\n      value\n    }\n    eventRatePerMinute {\n      label\n      value\n    }\n  }\n"): (typeof documents)["\n  query OpsLambdas {\n    lambdaErrorSummary(limit: 40) {\n      label\n      value\n    }\n    eventRatePerMinute {\n      label\n      value\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RootCauseTrace($quoteId: String, $requestId: String) {\n    rootCauseTrace(quoteId: $quoteId, requestId: $requestId) {\n      likelyFailureCategory\n      likelyFailedStage\n      latestEvent {\n        id\n        timestamp\n        message\n        status\n      }\n      firstFailureEvent {\n        id\n        timestamp\n        message\n      }\n      relatedEvents {\n        id\n        timestamp\n        eventType\n        message\n        status\n      }\n    }\n  }\n"): (typeof documents)["\n  query RootCauseTrace($quoteId: String, $requestId: String) {\n    rootCauseTrace(quoteId: $quoteId, requestId: $requestId) {\n      likelyFailureCategory\n      likelyFailedStage\n      latestEvent {\n        id\n        timestamp\n        message\n        status\n      }\n      firstFailureEvent {\n        id\n        timestamp\n        message\n      }\n      relatedEvents {\n        id\n        timestamp\n        eventType\n        message\n        status\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query HealthCheck {\n    health {\n      ok\n    }\n  }\n"): (typeof documents)["\n  query HealthCheck {\n    health {\n      ok\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RevenueOverview($walletAddress: String!) {\n    revenueSummary(walletAddress: $walletAddress) {\n      walletAddress\n      confirmedPaymentCount\n      totalAmount\n    }\n  }\n"): (typeof documents)["\n  query RevenueOverview($walletAddress: String!) {\n    revenueSummary(walletAddress: $walletAddress) {\n      walletAddress\n      confirmedPaymentCount\n      totalAmount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SalesRevenue($wallet: String!, $limit: Int!) {\n    revenueSummary(walletAddress: $wallet) {\n      walletAddress\n      confirmedPaymentCount\n      totalAmount\n    }\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n    }\n  }\n"): (typeof documents)["\n  query SalesRevenue($wallet: String!, $limit: Int!) {\n    revenueSummary(walletAddress: $wallet) {\n      walletAddress\n      confirmedPaymentCount\n      totalAmount\n    }\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SalesFunnel {\n    quoteFunnel {\n      quoteCreated\n      paymentSettled\n      uploadStarted\n      uploadConfirmed\n      quoteToPaymentRate\n      paymentToUploadRate\n      uploadToConfirmRate\n    }\n  }\n"): (typeof documents)["\n  query SalesFunnel {\n    quoteFunnel {\n      quoteCreated\n      paymentSettled\n      uploadStarted\n      uploadConfirmed\n      quoteToPaymentRate\n      paymentToUploadRate\n      uploadToConfirmRate\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SalesWallets($limit: Int!) {\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n      medianTransactionSize\n      firstSeenAt\n      lastSeenAt\n    }\n  }\n"): (typeof documents)["\n  query SalesWallets($limit: Int!) {\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n      medianTransactionSize\n      firstSeenAt\n      lastSeenAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TransactionsPage {\n    quoteFacts(limit: 500) {\n      quoteId\n      walletAddress\n      finalStatus\n      lastSeenAt\n      hasPaymentSettled\n      hasUploadConfirmed\n    }\n    statusDistribution {\n      label\n      value\n    }\n    objectDuplicateSummary {\n      objectIdHash\n      quoteCount\n    }\n  }\n"): (typeof documents)["\n  query TransactionsPage {\n    quoteFacts(limit: 500) {\n      quoteId\n      walletAddress\n      finalStatus\n      lastSeenAt\n      hasPaymentSettled\n      hasUploadConfirmed\n    }\n    statusDistribution {\n      label\n      value\n    }\n    objectDuplicateSummary {\n      objectIdHash\n      quoteCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query WalletDetail($walletAddress: String!) {\n    walletDetail(walletAddress: $walletAddress) {\n      wallet {\n        walletAddress\n        totalRevenue\n        totalQuotes\n        totalPaymentsSettled\n        totalUploadsConfirmed\n        totalFailures\n      }\n      quotes {\n        quoteId\n        finalStatus\n        lastSeenAt\n        hasPaymentSettled\n        hasUploadConfirmed\n      }\n      events {\n        id\n        timestamp\n        eventType\n        source\n        status\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  query WalletDetail($walletAddress: String!) {\n    walletDetail(walletAddress: $walletAddress) {\n      wallet {\n        walletAddress\n        totalRevenue\n        totalQuotes\n        totalPaymentsSettled\n        totalUploadsConfirmed\n        totalFailures\n      }\n      quotes {\n        quoteId\n        finalStatus\n        lastSeenAt\n        hasPaymentSettled\n        hasUploadConfirmed\n      }\n      events {\n        id\n        timestamp\n        eventType\n        source\n        status\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query WalletFactsPage($limit: Int!) {\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n      medianTransactionSize\n      lastSeenAt\n      firstSeenAt\n    }\n  }\n"): (typeof documents)["\n  query WalletFactsPage($limit: Int!) {\n    walletFacts(limit: $limit) {\n      walletAddress\n      totalRevenue\n      totalQuotes\n      medianTransactionSize\n      lastSeenAt\n      firstSeenAt\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;