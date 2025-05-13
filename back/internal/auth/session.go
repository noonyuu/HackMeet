package auth

import (
	"context"

	"github.com/redis/go-redis/v9"
)

// セッションID
type SessionId string

// セッション情報
type Session struct {
	Store *redis.Client
}

// 空のコンテキストを生成
var ctx = context.Background()

// セッションを生成
func NewSession() *Session {
	store := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	return &Session{Store: store}
}
