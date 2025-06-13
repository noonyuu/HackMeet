package util

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

func SyncRelatedRecords(ctx context.Context, tx *sql.Tx, workID string, newIDs []*string, table, workCol, relatedCol string) error {
	var currentIDs []string
	query := fmt.Sprintf("SELECT %s FROM %s WHERE %s = ?", relatedCol, table, workCol)
	rows, err := tx.QueryContext(ctx, query, workID)
	if err != nil {
		return fmt.Errorf("failed to fetch current related IDs from %s: %w", table, err)
	}
	defer rows.Close()
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return err
		}
		currentIDs = append(currentIDs, id)
	}

	// ポインタのスライスから値のスライスに変換
	newIDValues := make([]string, 0, len(newIDs))
	for _, idPtr := range newIDs {
		if idPtr != nil {
			newIDValues = append(newIDValues, *idPtr)
		}
	}

	toAdd, toRemove := CalculateDiff(currentIDs, newIDValues)
	now := time.Now()

	if len(toRemove) > 0 {
		deleteQuery := fmt.Sprintf("DELETE FROM %s WHERE %s = ? AND %s IN (?%s)", table, workCol, relatedCol, strings.Repeat(",?", len(toRemove)-1))
		args := []interface{}{workID}
		for _, id := range toRemove {
			args = append(args, id)
		}
		if _, err := tx.ExecContext(ctx, deleteQuery, args...); err != nil {
			return fmt.Errorf("failed to delete from %s: %w", table, err)
		}
	}

	if len(toAdd) > 0 {
		insertQuery := fmt.Sprintf("INSERT INTO %s (%s, %s, created_at, updated_at) VALUES ", table, workCol, relatedCol)
		var inserts []string
		var args []interface{}
		for _, id := range toAdd {
			inserts = append(inserts, "(?, ?, ?, ?)")
			args = append(args, workID, id, now, now)
		}
		insertQuery += strings.Join(inserts, ",")
		if _, err := tx.ExecContext(ctx, insertQuery, args...); err != nil {
			return fmt.Errorf("failed to insert into %s: %w", table, err)
		}
	}
	return nil
}

func SyncImages(ctx context.Context, tx *sql.Tx, workID string, newImageUrls []*string, imageTable, joinTable, joinImageCol string) error {
	if _, err := tx.ExecContext(ctx, fmt.Sprintf("DELETE FROM %s WHERE work_id = ?", joinTable), workID); err != nil {
		return fmt.Errorf("failed to delete old image relations from %s: %w", joinTable, err)
	}
	// 関連がなくなった古い画像を`images`テーブルから削除するクリーンアップ処理
	cleanupQuery := fmt.Sprintf("DELETE FROM %s WHERE id NOT IN (SELECT %s FROM %s)", imageTable, joinImageCol, joinTable)
	if _, err := tx.ExecContext(ctx, cleanupQuery); err != nil {
		return fmt.Errorf("failed to clean up old images in %s: %w", imageTable, err)
	}

	if len(newImageUrls) == 0 {
		return nil
	}

	now := time.Now()
	for _, imageUrlPtr := range newImageUrls {
		if imageUrlPtr == nil {
			continue
		}
		imageUID, _ := uuid.NewRandom()
		imageID := imageUID.String()
		imageQuery := fmt.Sprintf("INSERT INTO %s (id, image_url, created_at, updated_at) VALUES (?, ?, ?, ?)", imageTable)
		if _, err := tx.ExecContext(ctx, imageQuery, imageID, *imageUrlPtr, now, now); err != nil {
			return fmt.Errorf("failed to insert into %s: %w", imageTable, err)
		}
		joinQuery := fmt.Sprintf("INSERT INTO %s (work_id, %s, created_at, updated_at) VALUES (?, ?, ?, ?)", joinTable, joinImageCol)
		if _, err := tx.ExecContext(ctx, joinQuery, workID, imageID, now, now); err != nil {
			return fmt.Errorf("failed to insert into %s: %w", joinTable, err)
		}
	}
	return nil
}
