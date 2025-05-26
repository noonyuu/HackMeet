package server

import (
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/jmoiron/sqlx"
	"github.com/noonyuu/nfc/back/graph"
	"github.com/noonyuu/nfc/back/graph/resolver"
	"github.com/noonyuu/nfc/back/internal/auth"
	"github.com/noonyuu/nfc/back/internal/infrastructure/persistence"
	"github.com/noonyuu/nfc/back/internal/interfaces"
	handlerInterface "github.com/noonyuu/nfc/back/internal/interfaces/handler"
	"github.com/noonyuu/nfc/back/internal/usecase"
	"github.com/redis/go-redis/v9"
	"github.com/vektah/gqlparser/v2/ast"
)

func NewRouter(dbMysql *sqlx.DB, dbRedis *redis.Client, graphql *resolver.Resolver) http.Handler {
	mux := http.NewServeMux()
	hostUrl := os.Getenv("HOST_URL")

	auth.NewAuth()

	// User依存関係の注入
	userPersistence := persistence.NewUserPersistence(dbMysql)
	userUseCase := usecase.NewAuthUseCase(userPersistence)

	// Session依存関係の注入
	sessionPersistence := persistence.NewRedisSessionRepository(dbRedis)
	sessionUseCase := usecase.NewSessionUseCase(sessionPersistence)

	userHandler := handlerInterface.NewAuthController(userUseCase, sessionUseCase, graphql)

	// Ginルーターを初期化
	ginRouter := interfaces.NewRouter(userHandler)

	// CORSミドルウェア 開発用(仮)
	cors := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin == hostUrl {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			}

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

	// /pingエンドポイントをサーバールーターに直接追加
	mux.HandleFunc("/api/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"messages": "ping!!!!!!!!"}`))
	})

	// GraphQL handler 設定
	srv := handler.New(graph.NewExecutableSchema(graph.Config{
		Resolvers: &resolver.Resolver{
			DB: dbMysql,
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

	// 既存のエンドポイントへのルーティング
	mux.Handle("/api/v1/auth/", ginRouter)
	mux.Handle("/", playground.Handler("GraphQL playground", "/api/query"))

	// GraphQLクエリエンドポイントのみを設定し、プレイグラウンドは明示的に設定しない
	mux.Handle("/api/query", srv)

	return cors(mux)
}
