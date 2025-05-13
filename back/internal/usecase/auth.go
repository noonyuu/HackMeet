package usecase

import (
	"context"
	"log"
	"time"

	"github.com/noonyuu/nfc/back/graph/model" // graphqlで生成されたmodelをインポート
	"github.com/noonyuu/nfc/back/internal/domain/repository"

	"github.com/google/uuid"
	"github.com/markbates/goth"
)

type AuthUsecase interface {
	Create(ctx context.Context, input *CreateUserDTO, user goth.User) (*model.User, error)
	GetByUserID(ctx context.Context, input *GetByUserIdDTO) (*GetUserOutput, error)
	FindByEmail(ctx context.Context, email string, userID string, provider string) (*model.User, error)
}

type CreateUserDTO struct {
	Name      string
	Email     string
	AvatarURL string
}

type GetByUserIdDTO struct {
	ID string
}

type GetUserOutput struct {
	ID        string
	Email     string
	FirstName string
	LastName  string
}

type authUseCase struct {
	userRepository repository.UserRepository
}

func NewAuthUseCase(userRepository repository.UserRepository) AuthUsecase {
	return &authUseCase{
		userRepository: userRepository,
	}
}

func (u *authUseCase) Create(ctx context.Context, input *CreateUserDTO, userGoth goth.User) (*model.User, error) {
	userID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	now := time.Now()
	user := &model.User{
		ID:        userID.String(),
		FirstName: input.Name,
		LastName:  input.Name,
		Email:     input.Email,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := u.userRepository.Create(ctx, user, userGoth); err != nil {
		return nil, err
	}

	return user, nil
}

func (u *authUseCase) GetByUserID(ctx context.Context, input *GetByUserIdDTO) (*GetUserOutput, error) {
	user, err := u.userRepository.GetByUserID(ctx, input.ID)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, nil
	}

	output := &GetUserOutput{
		ID:        user.ID,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
	}

	return output, nil
}

func (u *authUseCase) FindByEmail(ctx context.Context, email string, userID string, provider string) (*model.User, error) {
	user, err := u.userRepository.FindByEmail(ctx, email, userID, provider)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, nil
	}
	log.Printf("user: %v", user)

	return user, nil
}
