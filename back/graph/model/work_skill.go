package model

import "time"

type WorkSkill struct {
	ID        int       `json:"id"`
	WorkID    int       `json:"work_id"`
	SkillID   int       `json:"skill_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Skill *Skill `json:"skill"`
	Work  *Work  `json:"work"`
}
