package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/noonyuu/nfc/back/internal/config"
	"github.com/noonyuu/nfc/back/internal/infrastructure/db"
	"github.com/noonyuu/nfc/back/internal/server"
)

func main() {
	fmt.Println("Starting the application...")

	cfg := config.Load()
	dbConn, err := db.Connect(cfg)
	if err != nil {
		log.Fatal("DB接続エラー: ", err)
	}
	defer dbConn.Close()

	fmt.Println("DB接続成功")

	// サーバー起動
	handler := server.NewRouter(dbConn)
	err = http.ListenAndServe(":8080", handler)
	if err != nil {
		log.Fatal("サーバー起動エラー: ", err)
	}
}
