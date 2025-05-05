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

	// CORSミドルウェア 開発用(仮)
	cors := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	}

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

	return cors(mux)
}
