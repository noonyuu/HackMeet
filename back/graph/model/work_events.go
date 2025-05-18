package model

import "time"

type WorkEvent struct {
	ID        string    `json:"id"`
	WorkID    string    `json:"work_id"`
	EventID   string    `json:"event_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Event *Event `json:"event"`
	Work  *Work  `json:"work"`
}
