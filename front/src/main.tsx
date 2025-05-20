import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";

import "./style/index.css";
import { routeTree } from "./routeTree.gen";

// 環境変数
const HOST_URL = import.meta.env.VITE_HOST_URL || "";

// HTTP リンクの作成
const httpLink = createHttpLink({
  uri: HOST_URL + "api/query",
  // credentials: "include",
});

// Apollo クライアントの作成
export const client = new ApolloClient({
  link: httpLink,
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
