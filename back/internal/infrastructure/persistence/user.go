package persistence

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/noonyuu/nfc/back/graph/model"
	"github.com/noonyuu/nfc/back/internal/domain/repository"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/markbates/goth"
)

// SQLクエリの定数
const (
	insertUserSQL         = "INSERT INTO users (id, first_name, last_name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
	insertAuthProviderSQL = "INSERT INTO providers (id, user_id, provider_id, provider, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
	selectUserByIDSQL     = "SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE id = ?"
	selectUserByEmailSQL  = "SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE email = ?"
	checkAuthProviderSQL  = "SELECT 1 FROM providers WHERE user_id = ? AND provider_id = ? LIMIT 1"
)

type userPersistence struct {
	db *sqlx.DB
}

func NewUserPersistence(db *sqlx.DB) repository.UserRepository {
	return &userPersistence{db: db}
}

// ユーザー登録
func (u *userPersistence) Create(ctx context.Context, user *model.User, userGoth goth.User) error {
	// トランザクション開始
	tx, err := u.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// エラー発生時にロールバックを保証
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// ユーザー情報を挿入
	_, err = tx.ExecContext(ctx, insertUserSQL,
		user.ID, user.FirstName, user.LastName, user.Email, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert user: %w", err)
	}

	// 認証プロバイダー情報のUUID生成
	providerID, err := uuid.NewV7()
	if err != nil {
		return fmt.Errorf("failed to generate UUID: %w", err)
	}

	// 認証プロバイダー情報を挿入
	_, err = tx.ExecContext(ctx, insertAuthProviderSQL,
		providerID, user.ID, userGoth.UserID, userGoth.Provider, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert auth provider: %w", err)
	}

	// プロフィールデータを初期登録
	_, err = tx.ExecContext(ctx, "INSERT INTO profiles (id, avatar_url, nick_name, affiliation, bio, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
		user.ID, userGoth.AvatarURL, userGoth.Name, "", "", user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert profile: %w", err)
	}

	// トランザクションコミット
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// ユーザー取得
func (u *userPersistence) GetByUserID(ctx context.Context, userID string) (*model.User, error) {
	user := new(model.User)
	err := u.db.QueryRowxContext(ctx, selectUserByIDSQL, userID).StructScan(user)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // ユーザーが見つからない場合はnilを返す
		}
		return nil, fmt.Errorf("failed to find user by ID: %w", err)
	}

	return user, nil
}

// メールアドレスからユーザー検索
func (u *userPersistence) FindByEmail(ctx context.Context, email, userID, provider string) (*model.User, error) {
	user := &model.User{}
	err := u.db.QueryRowContext(ctx, selectUserByEmailSQL, email).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to query user by email: %w", err)
	}

	// providersテーブルに認証プロバイダーが存在するか確認
	var exists bool
	err = u.db.QueryRowContext(ctx, checkAuthProviderSQL, user.ID, userID).Scan(&exists)

	if errors.Is(err, sql.ErrNoRows) {
		providerID, err := uuid.NewV7()
		if err != nil {
			return nil, fmt.Errorf("failed to generate UUID: %w", err)
		}

		now := time.Now()
		_, err = u.db.ExecContext(ctx, insertAuthProviderSQL,
			providerID, user.ID, userID, provider, now, now)

		if err != nil {
			return nil, fmt.Errorf("failed to insert auth provider: %w", err)
		}
	} else if err != nil {
		return nil, fmt.Errorf("failed to query auth provider: %w", err)
	}

	return user, nil
}
