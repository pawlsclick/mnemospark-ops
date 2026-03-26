"use client";

import { ApolloProvider } from "@apollo/client";
import { useMemo, type ReactNode } from "react";

import { makeApolloClient } from "@/lib/apollo-client";

export function DashboardApolloProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => makeApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
