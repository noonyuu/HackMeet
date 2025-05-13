package model

import "time"

type Session struct {
	Key       string        `json:"id" redis:"id"`
	Value     interface{}   `json:"value" redis:"value"`
	ExpiresAt time.Duration `json:"expires_at" redis:"expires_at"`
}
