package config

import (
	"log"
	"os"
)

type Config struct {
	DBUser     string
	DBPassword string
	DBName     string
	DBHost     string
	DBPort     string
}

func Load() *Config {
	return &Config{
		DBUser:     os.Getenv("MYSQL_USER"),
		DBPassword: os.Getenv("MYSQL_PASSWORD"),
		DBName:     os.Getenv("MYSQL_DATABASE"),
		DBHost:     "mysql", // Dockerコンテナ名
		DBPort:     "3306",
	}
}

// Redisの設定
func RedisAddress() string {
	address := os.Getenv("REDIS_PORT")
	if address == "" {
		log.Fatal("REDIS_PORT is not set")
	}
	return address
}
