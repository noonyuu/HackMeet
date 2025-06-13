package model

import "time"

type WorkProfile struct {
	ID        string    `json:"id"`
	WorkID    string    `json:"work_id"`
	ProfileID string    `json:"profile_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Profile *Profile `json:"profile"`
	Work    *Work    `json:"work"`
}
