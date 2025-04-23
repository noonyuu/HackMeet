package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	hello := []byte("Hello World!!!")
	_, err := w.Write(hello)
	if err != nil {
		log.Fatal("Error writing response:", err)
	}
}

func main() {
	fmt.Println("Starting the application...")

	// Hello World ハンドラを設定
	http.HandleFunc("/hello", helloHandler)

	// MySQL接続のためのDSN (Data Source Name)
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s",
		os.Getenv("MYSQL_USER"),
		os.Getenv("MYSQL_PASSWORD"),
		"mysql", // コンテナ名で指定
		"3306",  // ポート番号
		os.Getenv("MYSQL_DATABASE"),
	)

	// MySQLデータベース接続
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// データベース接続確認
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Successfully connected to the database!")

	// HTTP サーバーをポート 8080 で開始
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Error starting the server: ", err)
	}
}
