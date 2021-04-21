import { gql } from "@apollo/client"
import * as Apollo from "@apollo/client"

export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: any
  /**
   * Allows use of a JSON String for input / output from the GraphQL schema.
   *
   * Use of this type is *not recommended* as you lose the benefits of having a defined, static
   * schema (one of the key benefits of GraphQL).
   */
  JSONString: any
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: any
}

export type Query = {
  __typename?: "Query"
  currentUser?: Maybe<UserType>
  currentService: ServicePageNode
  /** The ID of the object */
  service?: Maybe<ServicePageNode>
  services?: Maybe<ServicePageNodeConnection>
  prayerRequests: PrayerRequestNodeConnection
}

export type QueryServiceArgs = {
  id: Scalars["ID"]
}

export type QueryServicesArgs = {
  before?: Maybe<Scalars["String"]>
  after?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  id?: Maybe<Scalars["ID"]>
  title?: Maybe<Scalars["String"]>
  slug?: Maybe<Scalars["String"]>
}

export type QueryPrayerRequestsArgs = {
  before?: Maybe<Scalars["String"]>
  after?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  id?: Maybe<Scalars["ID"]>
}

export type UserType = {
  __typename?: "UserType"
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: Scalars["String"]
  firstName: Scalars["String"]
  lastName: Scalars["String"]
  isChatmod: Scalars["Boolean"]
  groups?: Maybe<Array<Maybe<Scalars["String"]>>>
}

export type ServicePageNode = Node & {
  __typename?: "ServicePageNode"
  /** The ID of the object. */
  id: Scalars["ID"]
  /** The page title as you'd like it to be seen by the public */
  title: Scalars["String"]
  /** The name of the page as it will appear in URLs e.g http://domain.com/blog/[my-slug]/ */
  slug: Scalars["String"]
  date: Scalars["Date"]
  description: Scalars["String"]
  streamLink: Scalars["String"]
  pk: Scalars["Int"]
  bulletin?: Maybe<Scalars["JSONString"]>
  editUrl?: Maybe<Scalars["String"]>
}

/** An object with an ID */
export type Node = {
  /** The ID of the object. */
  id: Scalars["ID"]
}

export type ServicePageNodeConnection = {
  __typename?: "ServicePageNodeConnection"
  /** Pagination data for this connection. */
  pageInfo: PageInfo
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ServicePageNodeEdge>>
}

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: "PageInfo"
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars["Boolean"]
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars["Boolean"]
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars["String"]>
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars["String"]>
}

/** A Relay edge containing a `ServicePageNode` and its cursor. */
export type ServicePageNodeEdge = {
  __typename?: "ServicePageNodeEdge"
  /** The item at the end of the edge */
  node?: Maybe<ServicePageNode>
  /** A cursor for use in pagination */
  cursor: Scalars["String"]
}

export type PrayerRequestNodeConnection = {
  __typename?: "PrayerRequestNodeConnection"
  /** Pagination data for this connection. */
  pageInfo: PageInfo
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<PrayerRequestNodeEdge>>
}

/** A Relay edge containing a `PrayerRequestNode` and its cursor. */
export type PrayerRequestNodeEdge = {
  __typename?: "PrayerRequestNodeEdge"
  /** The item at the end of the edge */
  node?: Maybe<PrayerRequestNode>
  /** A cursor for use in pagination */
  cursor: Scalars["String"]
}

export type PrayerRequestNode = Node & {
  __typename?: "PrayerRequestNode"
  createdAt: Scalars["DateTime"]
  bodyVisibility: PrayerRequestBodyVisibility
  providedName: Scalars["String"]
  body: Scalars["String"]
  note: Scalars["String"]
  state: PrayerRequestState
  /** The ID of the object. */
  id: Scalars["ID"]
  pk: Scalars["Int"]
}

/** An enumeration. */
export enum PrayerRequestBodyVisibility {
  /** Only you */
  A = "A_",
  /** Only Crossroads members */
  Member = "MEMBER",
  /** Only Crossroads prayer team members */
  PrayerTeam = "PRAYER_TEAM",
}

/** An enumeration. */
export enum PrayerRequestState {
  /** Active */
  Act = "ACT",
  /** Answered */
  Ans = "ANS",
}

export type Mutation = {
  __typename?: "Mutation"
  addPrayerRequest?: Maybe<AddPrayerRequest>
}

export type MutationAddPrayerRequestArgs = {
  body?: Maybe<Scalars["String"]>
  bodyVisibility?: Maybe<Scalars["String"]>
  displayName?: Maybe<Scalars["String"]>
  includeName?: Maybe<Scalars["Boolean"]>
}

export type AddPrayerRequest = {
  __typename?: "AddPrayerRequest"
  ok?: Maybe<Scalars["Boolean"]>
  prayerRequest?: Maybe<PrayerRequestNode>
}

export type UserQueryVariables = Exact<{ [key: string]: never }>

export type UserQuery = { __typename?: "Query" } & {
  currentUser?: Maybe<
    { __typename?: "UserType" } & Pick<
      UserType,
      "username" | "firstName" | "lastName" | "isChatmod"
    >
  >
}

export type HomePageQueryVariables = Exact<{ [key: string]: never }>

export type HomePageQuery = { __typename?: "Query" } & {
  currentService: { __typename?: "ServicePageNode" } & Pick<
    ServicePageNode,
    "slug" | "title"
  >
}

export type PrayerPageQueryVariables = Exact<{ [key: string]: never }>

export type PrayerPageQuery = { __typename?: "Query" } & {
  prayerRequests: { __typename?: "PrayerRequestNodeConnection" } & {
    edges: Array<
      Maybe<
        { __typename?: "PrayerRequestNodeEdge" } & {
          node?: Maybe<
            { __typename?: "PrayerRequestNode" } & Pick<
              PrayerRequestNode,
              | "createdAt"
              | "pk"
              | "providedName"
              | "body"
              | "bodyVisibility"
              | "note"
              | "state"
            >
          >
        }
      >
    >
  }
}

export type AddPrayerRequestMutationVariables = Exact<{
  body: Scalars["String"]
  bodyVisibility: Scalars["String"]
  includeName: Scalars["Boolean"]
}>

export type AddPrayerRequestMutation = { __typename?: "Mutation" } & {
  addPrayerRequest?: Maybe<
    { __typename?: "AddPrayerRequest" } & Pick<AddPrayerRequest, "ok">
  >
}

export type ServicePageQueryVariables = Exact<{
  slug: Scalars["String"]
}>

export type ServicePageQuery = { __typename?: "Query" } & {
  services?: Maybe<
    { __typename?: "ServicePageNodeConnection" } & {
      edges: Array<
        Maybe<
          { __typename?: "ServicePageNodeEdge" } & {
            node?: Maybe<
              { __typename?: "ServicePageNode" } & Pick<
                ServicePageNode,
                | "bulletin"
                | "date"
                | "editUrl"
                | "id"
                | "pk"
                | "slug"
                | "title"
                | "description"
                | "streamLink"
              >
            >
          }
        >
      >
    }
  >
}

export type ServicePagesQueryVariables = Exact<{ [key: string]: never }>

export type ServicePagesQuery = { __typename?: "Query" } & {
  services?: Maybe<
    { __typename?: "ServicePageNodeConnection" } & {
      edges: Array<
        Maybe<
          { __typename?: "ServicePageNodeEdge" } & {
            node?: Maybe<
              { __typename?: "ServicePageNode" } & Pick<
                ServicePageNode,
                "slug" | "title" | "description"
              >
            >
          }
        >
      >
    }
  >
}

export const UserDocument = gql`
  query User {
    currentUser {
      username
      firstName
      lastName
      isChatmod
    }
  }
`

/**
 * __useUserQuery__
 *
 * To run a query within a React component, call `useUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserQuery(
  baseOptions?: Apollo.QueryHookOptions<UserQuery, UserQueryVariables>
) {
  return Apollo.useQuery<UserQuery, UserQueryVariables>(
    UserDocument,
    baseOptions
  )
}
export function useUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<UserQuery, UserQueryVariables>
) {
  return Apollo.useLazyQuery<UserQuery, UserQueryVariables>(
    UserDocument,
    baseOptions
  )
}
export type UserQueryHookResult = ReturnType<typeof useUserQuery>
export type UserLazyQueryHookResult = ReturnType<typeof useUserLazyQuery>
export type UserQueryResult = Apollo.QueryResult<UserQuery, UserQueryVariables>
export const HomePageDocument = gql`
  query HomePage {
    currentService {
      slug
      title
    }
  }
`

/**
 * __useHomePageQuery__
 *
 * To run a query within a React component, call `useHomePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useHomePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHomePageQuery({
 *   variables: {
 *   },
 * });
 */
export function useHomePageQuery(
  baseOptions?: Apollo.QueryHookOptions<HomePageQuery, HomePageQueryVariables>
) {
  return Apollo.useQuery<HomePageQuery, HomePageQueryVariables>(
    HomePageDocument,
    baseOptions
  )
}
export function useHomePageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HomePageQuery,
    HomePageQueryVariables
  >
) {
  return Apollo.useLazyQuery<HomePageQuery, HomePageQueryVariables>(
    HomePageDocument,
    baseOptions
  )
}
export type HomePageQueryHookResult = ReturnType<typeof useHomePageQuery>
export type HomePageLazyQueryHookResult = ReturnType<
  typeof useHomePageLazyQuery
>
export type HomePageQueryResult = Apollo.QueryResult<
  HomePageQuery,
  HomePageQueryVariables
>
export const PrayerPageDocument = gql`
  query PrayerPage {
    prayerRequests {
      edges {
        node {
          createdAt
          pk
          providedName
          body
          bodyVisibility
          note
          state
        }
      }
    }
  }
`

/**
 * __usePrayerPageQuery__
 *
 * To run a query within a React component, call `usePrayerPageQuery` and pass it any options that fit your needs.
 * When your component renders, `usePrayerPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePrayerPageQuery({
 *   variables: {
 *   },
 * });
 */
export function usePrayerPageQuery(
  baseOptions?: Apollo.QueryHookOptions<
    PrayerPageQuery,
    PrayerPageQueryVariables
  >
) {
  return Apollo.useQuery<PrayerPageQuery, PrayerPageQueryVariables>(
    PrayerPageDocument,
    baseOptions
  )
}
export function usePrayerPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PrayerPageQuery,
    PrayerPageQueryVariables
  >
) {
  return Apollo.useLazyQuery<PrayerPageQuery, PrayerPageQueryVariables>(
    PrayerPageDocument,
    baseOptions
  )
}
export type PrayerPageQueryHookResult = ReturnType<typeof usePrayerPageQuery>
export type PrayerPageLazyQueryHookResult = ReturnType<
  typeof usePrayerPageLazyQuery
>
export type PrayerPageQueryResult = Apollo.QueryResult<
  PrayerPageQuery,
  PrayerPageQueryVariables
>
export const AddPrayerRequestDocument = gql`
  mutation AddPrayerRequest(
    $body: String!
    $bodyVisibility: String!
    $includeName: Boolean!
  ) {
    addPrayerRequest(
      body: $body
      bodyVisibility: $bodyVisibility
      includeName: $includeName
    ) {
      ok
    }
  }
`
export type AddPrayerRequestMutationFn = Apollo.MutationFunction<
  AddPrayerRequestMutation,
  AddPrayerRequestMutationVariables
>

/**
 * __useAddPrayerRequestMutation__
 *
 * To run a mutation, you first call `useAddPrayerRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPrayerRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPrayerRequestMutation, { data, loading, error }] = useAddPrayerRequestMutation({
 *   variables: {
 *      body: // value for 'body'
 *      bodyVisibility: // value for 'bodyVisibility'
 *      includeName: // value for 'includeName'
 *   },
 * });
 */
export function useAddPrayerRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddPrayerRequestMutation,
    AddPrayerRequestMutationVariables
  >
) {
  return Apollo.useMutation<
    AddPrayerRequestMutation,
    AddPrayerRequestMutationVariables
  >(AddPrayerRequestDocument, baseOptions)
}
export type AddPrayerRequestMutationHookResult = ReturnType<
  typeof useAddPrayerRequestMutation
>
export type AddPrayerRequestMutationResult = Apollo.MutationResult<AddPrayerRequestMutation>
export type AddPrayerRequestMutationOptions = Apollo.BaseMutationOptions<
  AddPrayerRequestMutation,
  AddPrayerRequestMutationVariables
>
export const ServicePageDocument = gql`
  query ServicePage($slug: String!) {
    services(slug: $slug) {
      edges {
        node {
          bulletin
          date
          editUrl
          id
          pk
          slug
          title
          description
          streamLink
        }
      }
    }
  }
`

/**
 * __useServicePageQuery__
 *
 * To run a query within a React component, call `useServicePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useServicePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServicePageQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useServicePageQuery(
  baseOptions: Apollo.QueryHookOptions<
    ServicePageQuery,
    ServicePageQueryVariables
  >
) {
  return Apollo.useQuery<ServicePageQuery, ServicePageQueryVariables>(
    ServicePageDocument,
    baseOptions
  )
}
export function useServicePageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServicePageQuery,
    ServicePageQueryVariables
  >
) {
  return Apollo.useLazyQuery<ServicePageQuery, ServicePageQueryVariables>(
    ServicePageDocument,
    baseOptions
  )
}
export type ServicePageQueryHookResult = ReturnType<typeof useServicePageQuery>
export type ServicePageLazyQueryHookResult = ReturnType<
  typeof useServicePageLazyQuery
>
export type ServicePageQueryResult = Apollo.QueryResult<
  ServicePageQuery,
  ServicePageQueryVariables
>
export const ServicePagesDocument = gql`
  query ServicePages {
    services {
      edges {
        node {
          slug
          title
          description
        }
      }
    }
  }
`

/**
 * __useServicePagesQuery__
 *
 * To run a query within a React component, call `useServicePagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useServicePagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServicePagesQuery({
 *   variables: {
 *   },
 * });
 */
export function useServicePagesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ServicePagesQuery,
    ServicePagesQueryVariables
  >
) {
  return Apollo.useQuery<ServicePagesQuery, ServicePagesQueryVariables>(
    ServicePagesDocument,
    baseOptions
  )
}
export function useServicePagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServicePagesQuery,
    ServicePagesQueryVariables
  >
) {
  return Apollo.useLazyQuery<ServicePagesQuery, ServicePagesQueryVariables>(
    ServicePagesDocument,
    baseOptions
  )
}
export type ServicePagesQueryHookResult = ReturnType<
  typeof useServicePagesQuery
>
export type ServicePagesLazyQueryHookResult = ReturnType<
  typeof useServicePagesLazyQuery
>
export type ServicePagesQueryResult = Apollo.QueryResult<
  ServicePagesQuery,
  ServicePagesQueryVariables
>
