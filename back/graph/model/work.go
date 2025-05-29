package model

import (
	"time"
)

type Work struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	ImageURL    string    `json:"imageUrl"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`

	EventID *string  `json:"eventId"`
	UserIDs []string `json:"userIds"`

	Profiles []Profile `json:"profile"`
	Events   []*Event  `json:"event"`
	Skills   []Skill   `json:"skills"`
}

type WorkEdge struct {
	Node   *Work  `json:"node"`
	Cursor string `json:"cursor"`
}

type PageInfo struct {
	HasNextPage     bool    `json:"hasNextPage"`
	HasPreviousPage bool    `json:"hasPreviousPage"`
	StartCursor     *string `json:"startCursor"`
	EndCursor       *string `json:"endCursor"`
}

type WorkConnection struct {
	Edges    []*WorkEdge `json:"edges"`
	PageInfo PageInfo    `json:"pageInfo"`
}
