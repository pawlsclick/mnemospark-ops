import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

import { getGraphqlHttpUrl, shouldUseMockGraphql } from "@/lib/graphql-env";
import { createMockDashboardLink } from "@/lib/mock-graphql-link";

function createLink(): ApolloLink {
  if (shouldUseMockGraphql()) {
    return createMockDashboardLink();
  }
  const uri = getGraphqlHttpUrl();
  if (!uri) {
    return createMockDashboardLink();
  }
  return new HttpLink({ uri, credentials: "same-origin" });
}

export function makeApolloClient(): ApolloClient {
  return new ApolloClient({
    link: createLink(),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: "network-only" },
      query: { fetchPolicy: "network-only" },
    },
  });
}
