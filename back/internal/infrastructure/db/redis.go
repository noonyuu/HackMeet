package db

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

func ConnectRedis() (*redis.Client, error) {
	// Redisの接続情報を取得
	address := "redis:6379"
	password := ""
	db := 0

	// Redisに接続
	client := redis.NewClient(&redis.Options{
		Addr:     address,
		Password: password, // パスワードが設定されていない場合は空文字列
		DB:       db,       // デフォルトDBを使用
	})

	// 接続確認
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return client, nil
}
