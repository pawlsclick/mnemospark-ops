import { ApolloLink, Observable } from "@apollo/client";
import { GraphQLError } from "graphql";

import type { FetchResult } from "@apollo/client";

function mockResult(operationName: string | undefined): FetchResult {
  switch (operationName) {
    case "HealthCheck":
      return {
        data: {
          health: { ok: true, __typename: "Health" },
        },
      };
    case "RevenueOverview":
      return {
        data: {
          revenueSummary: {
            walletAddress: "0xabc0000000000000000000000000000000000000",
            confirmedPaymentCount: 3,
            totalAmount: "1250.500000",
            __typename: "RevenueSummary",
          },
        },
      };
    default:
      return {
        errors: [
          new GraphQLError(
            `Mock GraphQL: unsupported operation "${operationName ?? "unknown"}"`
          ),
        ],
      };
  }
}

/**
 * Local / CI stand-in while the dashboard GraphQL Lambda is under construction.
 * Replace with HttpLink to the real endpoint via NEXT_PUBLIC_GRAPHQL_ENDPOINT.
 */
export function createMockDashboardLink(): ApolloLink {
  return new ApolloLink((operation) => {
    return new Observable((observer) => {
      try {
        const result = mockResult(operation.operationName);
        observer.next(result);
        observer.complete();
      } catch (e) {
        observer.error(e);
      }
    });
  });
}
