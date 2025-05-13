package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/noonyuu/nfc/back/graph/resolver"
	"github.com/noonyuu/nfc/back/internal/config"
	"github.com/noonyuu/nfc/back/internal/infrastructure/db"
	"github.com/noonyuu/nfc/back/internal/server"
)

func main() {
	fmt.Println("Starting the application...")

	cfg := config.Load()

	// MySQLの初期化
	dbConn, err := db.ConnectMysql(cfg)
	if err != nil {
		log.Fatal("DB接続エラー: ", err)
	}
	defer dbConn.Close()

	// Redisの初期化
	redisConn, err := db.ConnectRedis()
	if err != nil {
		log.Fatal("Redis接続エラー: ", err)
	}
	defer redisConn.Close()

	// GraphQLの初期化
	graphql := &resolver.Resolver{DB: dbConn}
	// サーバー起動
	handler := server.NewRouter(dbConn, redisConn, graphql)
	err = http.ListenAndServe(":8080", handler)
	if err != nil {
		log.Fatal("サーバー起動エラー: ", err)
	}
}
