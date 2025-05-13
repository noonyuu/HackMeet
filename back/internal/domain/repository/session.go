package repository

import (
	"github.com/noonyuu/nfc/back/internal/domain/model"
	"context"
)

type SessionRepository interface {
	Save(ctx context.Context, session *model.Session) error
	Get(ctx context.Context, sessionID string) (*model.Session , error)
	Delete(ctx context.Context, sessionID string) error
}
