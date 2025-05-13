package model

type Provider struct {
	ID         string `json:"id"`
	UserID     string `json:"user_id"`
	ProviderID string `json:"provider_id"`
	Provider   string `json:"provider"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`

	User *User `json:"user"`
}
