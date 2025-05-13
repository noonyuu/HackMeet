package usecase

import (
	"context"
	"time"

	"github.com/noonyuu/nfc/back/internal/domain/model"
	"github.com/noonyuu/nfc/back/internal/domain/repository"
)

type SessionUsecase interface {
	Save(cts context.Context, key string, value interface{}, expired time.Duration) (*model.Session, error)
	Get(ctx context.Context, key string) (*model.Session, error)
	Delete(ctx context.Context, key string) error
}

type sessionUsecase struct {
	sessionRepository repository.SessionRepository
}

func NewSessionUseCase(sessionRepository repository.SessionRepository) SessionUsecase {
	return &sessionUsecase{
		sessionRepository: sessionRepository,
	}
}

func (s *sessionUsecase) Save(ctx context.Context, key string, value interface{}, expired time.Duration) (*model.Session, error) {

	session := &model.Session{
		Key:       key,
		Value:     value,
		ExpiresAt: expired,
	}

	// セッションを保存
	if err := s.sessionRepository.Save(ctx, session); err != nil {
		return nil, err
	}

	return session, nil
}

func (s *sessionUsecase) Get(ctx context.Context, key string) (*model.Session, error) {
	session, err := s.sessionRepository.Get(ctx, key)
	if err != nil {
		return nil, err
	}
	return session, nil
}

func (s *sessionUsecase) Delete(ctx context.Context, sessionID string) error {
	return s.sessionRepository.Delete(ctx, sessionID)
}
