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
};

/** Dashboard GraphQL API (authoritative contract for field-level typing). */
export type Health = {
  __typename?: 'Health';
  ok: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  health: Health;
  revenueSummary: RevenueSummary;
};

export type RevenueSummary = {
  __typename?: 'RevenueSummary';
  currency: Scalars['String']['output'];
  totalCents: Scalars['Int']['output'];
};

export type DashboardOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardOverviewQuery = { __typename?: 'Query', health: { __typename?: 'Health', ok: boolean }, revenueSummary: { __typename?: 'RevenueSummary', totalCents: number, currency: string } };


export const DashboardOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardOverview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}},{"kind":"Field","name":{"kind":"Name","value":"revenueSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]} as unknown as DocumentNode<DashboardOverviewQuery, DashboardOverviewQueryVariables>;