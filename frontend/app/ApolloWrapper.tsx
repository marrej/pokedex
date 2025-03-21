"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        pokemons: {
          keyArgs: ['search', 'type', 'isFavorite'],
          merge(existing, incoming) {
            if (!existing) {
              return incoming;
            }
            return {...existing, edges:[...existing.edges, ...incoming.edges]};
          },
        }
      }
    }
  }
})

function makeClient() {
  const httpLink = new HttpLink({
    // Used for development
    // uri: "https://4000-brainsoft-eu-frontend-co-4vqxsmn2dm.app.codeanywhere.com/graphql",
    uri: "http://localhost:4000/graphql",
  });

  return new ApolloClient({
    cache,
    link: httpLink,
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}