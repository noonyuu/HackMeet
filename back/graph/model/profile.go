package model

import (
	"time"
)

type Profile struct {
	ID             string    `json:"id"`
	AvatarURL      string    `json:"avatar_url"`
	NickName       string    `json:"nick_name"`
	GraduationYear *int32    `json:"graduation_year"`
	Affiliation    *string   `json:"affiliation"`
	Bio            *string   `json:"bio"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	User   *User    `json:"user"`
	Works  []*Work  `json:"works"`
	Events []*Event `json:"events"`
	Skills []*Skill `json:"skills"`
}
