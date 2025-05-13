package repository

import (
	"context"

	"github.com/noonyuu/nfc/back/graph/model"

	"github.com/markbates/goth"
)

type UserRepository interface {
	Create(ctx context.Context, user *model.User, userP goth.User) error
	GetByUserID(ctx context.Context, userID string) (*model.User, error)
	FindByEmail(ctx context.Context, email string, userID string, provider string) (*model.User, error)
}
