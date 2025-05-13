package persistence

import (
	"context"
	"fmt"

	"github.com/noonyuu/nfc/back/internal/domain/model"
	"github.com/noonyuu/nfc/back/internal/domain/repository"

	"github.com/redis/go-redis/v9"
)

type RedisSessionRepository struct {
	client *redis.Client
}

func NewRedisSessionRepository(client *redis.Client) repository.SessionRepository {
	return &RedisSessionRepository{client: client}
}

func (r *RedisSessionRepository) Save(ctx context.Context, session *model.Session) error {
	err := r.client.Set(ctx, session.Key, session.Value, session.ExpiresAt).Err()
	if err != nil {
		return fmt.Errorf("failed to save session in redis: %w", err)
	}

	return nil
}

func (r *RedisSessionRepository) Get(ctx context.Context, key string) (*model.Session, error) {
	// セッションを取得
	data, err := r.client.Get(ctx, key).Result()
	fmt.Println("data", data)
	if err == redis.Nil {
		// セッションが存在しない場合
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("failed to get session from redis: %w", err)
	}

	session := &model.Session{
		Key:   key,
		Value: data,
	}

	return session, nil
}

func (r *RedisSessionRepository) Delete(ctx context.Context, sessionID string) error {
	if err := r.client.Del(ctx, sessionID).Err(); err != nil {
		return fmt.Errorf("failed to delete session from redis: %w", err)
	}
	return nil
}
