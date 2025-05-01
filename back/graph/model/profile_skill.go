package model

import "time"

type ProfileSkill struct {
	ID        string    `json:"id"`
	ProfileID string    `json:"profile_id"`
	SkillID   string    `json:"skill_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Skill   *Skill   `json:"skill"`
	Profile *Profile `json:"profile"`
}
