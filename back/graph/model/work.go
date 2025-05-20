package model

import "time"

type Work struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	EventID string `json:"event_id"`
	UserID  string `json:"user_id"`

	Profiles []*Profile `json:"profile"`
	Events   []*Event   `json:"event"`
	Skills   []*Skill   `json:"skills"`
}
