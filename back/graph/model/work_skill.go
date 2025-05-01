package model

import "time"

type WorkSkill struct {
	ID        int32     `json:"id"`
	WorkID    string    `json:"work_id"`
	SkillID   string    `json:"skill_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Skill *Skill `json:"skill"`
	Work  *Work  `json:"work"`
}
