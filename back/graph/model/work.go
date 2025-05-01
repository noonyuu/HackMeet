package model

import "time"

type Work struct {
	ID          string    `json:"id"`
	EventID     string    `json:"event_id"`
	ProfileID   string    `json:"profile_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Profile *Profile `json:"profile"`
	Event   []*Event `json:"event"`
	Skills  []*Skill `json:"skills"`
}
