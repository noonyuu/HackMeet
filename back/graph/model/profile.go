package model

type Profile struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	AvatarURL string `json:"avatar_url"`
	Nickname  string `json:"nickname"`
	Bio       string `json:"bio"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`

	User *User `json:"user"`
}
