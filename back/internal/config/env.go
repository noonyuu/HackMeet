package config

import (
	"log"

	"github.com/joho/godotenv"
)

// 環境変数を読み込む
func LoadEnv() error {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}
	return nil
}
