package server

import (
	"database/sql"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/noonyuu/nfc/back/graph"
	"github.com/noonyuu/nfc/back/graph/resolver"
	"github.com/vektah/gqlparser/v2/ast"
)

func NewRouter(db *sql.DB) http.Handler {
	mux := http.NewServeMux()

	// Hello エンドポイント
	mux.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello World!!!!!!"))
	})

	// GraphQL handler 設定
	srv := handler.New(graph.NewExecutableSchema(graph.Config{
		Resolvers: &resolver.Resolver{
			DB: db,
		},
	}))

	srv.AddTransport(transport.Options{})

	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))
	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	mux.Handle("/", playground.Handler("GraphQL playground", "/api/query"))
	mux.Handle("/api/query", srv)

	return mux
}
