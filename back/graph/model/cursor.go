package model

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"
	"log"
)

// Cursor はページネーションのための情報を保持
type Cursor struct {
	CreatedAt time.Time `json:"createdAt"`
	ID        string    `json:"id"`
}

// EncodeCursor は Cursor を JSON にして Base64 エンコードする
func EncodeCursor(c Cursor) string {
	jsonData, _ := json.Marshal(c)
	return base64.StdEncoding.EncodeToString(jsonData)
}

// DecodeCursor は Base64 → JSON → Cursor に変換する
func DecodeCursor(encoded string) (*Cursor, error) {
	data, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		log.Printf("failed to decode base64: %v", err)

		return nil, fmt.Errorf("failed to decode base64")
	}
	var cursor Cursor
	if err := json.Unmarshal(data, &cursor); err != nil {
		log.Printf("failed to unmarshal cursor JSON: %v", err)
		
		return nil, fmt.Errorf("failed to unmarshal cursor JSON")
	}
	return &cursor, nil
}
