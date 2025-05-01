package model

import "time"

type Profile struct {
	ID             string    `json:"id"`
	UserID         string    `json:"user_id"`
	AvatarURL      string    `json:"avatar_url"`
	Nickname       string    `json:"nickname"`
	GraduationYear string    `json:"graduation_year"`
	Affiliation    string    `json:"affiliation"`
	Bio            string    `json:"bio"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	User *User `json:"user"`
}
