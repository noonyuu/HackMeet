import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import "./style/index.css";
import { routeTree } from "./routeTree.gen";

const client = new ApolloClient({
  uri: "http://localhost:8443/api/query",
  cache: new InMemoryCache(),
});

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={client}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </ApolloProvider>,
);
