package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.72

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/noonyuu/nfc/back/graph"
	"github.com/noonyuu/nfc/back/graph/model"
	"github.com/vektah/gqlparser/gqlerror"
)

// StartDate is the resolver for the startDate field.
func (r *eventResolver) StartDate(ctx context.Context, obj *model.Event) (string, error) {
	return obj.StartDate.Format("2006-01-02 15:04:05"), nil
}

// EndDate is the resolver for the endDate field.
func (r *eventResolver) EndDate(ctx context.Context, obj *model.Event) (string, error) {
	return obj.EndDate.Format("2006-01-02 15:04:05"), nil
}

// CreatedAt is the resolver for the createdAt field.
func (r *eventResolver) CreatedAt(ctx context.Context, obj *model.Event) (string, error) {
	return obj.CreatedAt.Format("2006-01-02 15:04:05"), nil
}

// UpdatedAt is the resolver for the updatedAt field.
func (r *eventResolver) UpdatedAt(ctx context.Context, obj *model.Event) (string, error) {
	return obj.UpdatedAt.Format("2006-01-02 15:04:05"), nil
}

// CreateEvent is the resolver for the createEvent field.
func (r *mutationResolver) CreateEvent(ctx context.Context, input model.NewEvent) (*model.Event, error) {
	// uuidを生成
	uid, _ := uuid.NewRandom()
	// 生成したUUIDを文字列に変換
	uidString := uid.String()
	// 現在時刻を取得
	now := time.Now()
	// startとendのデータ型を変換
	startDate, err := time.Parse("2006-01-02 15:04:05", input.StartDate)
	if err != nil {
		log.Printf("failed to parse startDate: %v", err)

		return nil, &gqlerror.Error{
			Message: "日付の形式が正しくありません。'YYYY-MM-DD HH:MM:SS' の形式で入力してください。",
			Extensions: map[string]interface{}{
				"code": "BAD_USER_INPUT",
			},
		}
	}
	endDate, err := time.Parse("2006-01-02 15:04:05", input.EndDate)
	if err != nil {
		log.Printf("failed to parse startDate: %v", err)

		return nil, &gqlerror.Error{
			Message: "日付の形式が正しくありません。'YYYY-MM-DD HH:MM:SS' の形式で入力してください。",
			Extensions: map[string]interface{}{
				"code": "BAD_USER_INPUT",
			},
		}
	}
	// Event構造体にUUIDと現在時刻をセット
	event := &model.Event{
		ID:          uidString,
		Name:        input.Name,
		Description: input.Description,
		StartDate:   startDate,
		EndDate:     endDate,
		Location:    input.Location,
		CreatedAt:   now,
		UpdatedAt:   now,
		CreatedBy:   input.CreatedBy,
		UpdatedBy:   input.CreatedBy,
	}

	query := `
		INSERT INTO events (id, name, description, start_date, end_date, location, created_at, updated_at, created_by, updated_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err = r.DB.Exec(query, event.ID, event.Name, event.Description, event.StartDate, event.EndDate, event.Location, now, now, event.CreatedBy, event.UpdatedBy)
	if err != nil {
		log.Printf("failed to insert event: %v", err)

		// その他のデータベースエラーの場合は、汎用的なメッセージを返す
		return nil, &gqlerror.Error{
			Message: "イベントの作成中にサーバーエラーが発生しました。",
			Extensions: map[string]interface{}{
				"code": "INTERNAL_SERVER_ERROR",
			},
		}
	}

	return event, nil
}

// Events is the resolver for the events field.
func (r *queryResolver) Events(ctx context.Context) ([]*model.Event, error) {
	query := `
    SELECT id, name, description, start_date, end_date, location,
           created_at, updated_at, created_by, updated_by
    FROM (
      SELECT id, name, description, start_date, end_date, location,
            created_at, updated_at, created_by, updated_by,
            ROW_NUMBER() OVER (PARTITION BY created_by ORDER BY created_at DESC) AS rn
      FROM events
    ) AS ranked
    WHERE rn <= 10;
  `
	rows, err := r.DB.Query(query)
	if err != nil {
		log.Printf("failed to query events: %v", err)

		return nil, &gqlerror.Error{
			Message: "イベントの取得中にサーバーエラーが発生しました。",
			Extensions: map[string]interface{}{
				"code": "INTERNAL_SERVER_ERROR",
			},
		}
	}
	defer rows.Close()

	var events []*model.Event
	for rows.Next() {
		var event model.Event
		err := rows.Scan(
			&event.ID,
			&event.Name,
			&event.Description,
			&event.StartDate,
			&event.EndDate,
			&event.Location,
			&event.CreatedAt,
			&event.UpdatedAt,
			&event.CreatedBy,
			&event.UpdatedBy,
		)
		if err != nil {
			log.Printf("failed to scan event: %v", err)

			return nil, &gqlerror.Error{
				Message: "イベントの取得中にサーバーエラーが発生しました。",
				Extensions: map[string]interface{}{
					"code": "INTERNAL_SERVER_ERROR",
				},
			}
		}
		events = append(events, &event)
	}

	if err := rows.Err(); err != nil {
		log.Printf("error iterating over events: %v", err)
		return nil, &gqlerror.Error{
			Message: "イベントの取得中にサーバーエラーが発生しました。",
			Extensions: map[string]interface{}{
				"code": "INTERNAL_SERVER_ERROR",
			},
		}
	}

	return events, nil
}

// EventByID is the resolver for the eventById field.
func (r *queryResolver) EventByID(ctx context.Context, id string) (*model.Event, error) {
	query := `
		SELECT id, name, description, start_date, end_date, location, created_at, updated_at, created_by, updated_by
		FROM events
		WHERE id = ?
	`
	row := r.DB.QueryRow(query, id)
	var event model.Event
	err := row.Scan(
		&event.ID,
		&event.Name,
		&event.Description,
		&event.StartDate,
		&event.EndDate,
		&event.Location,
		&event.CreatedAt,
		&event.UpdatedAt,
		&event.CreatedBy,
		&event.UpdatedBy,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("event not found")
		}
		log.Printf("failed to query event by ID: %v", err)

		return nil, &gqlerror.Error{
			Message: "イベントの取得中にサーバーエラーが発生しました。",
			Extensions: map[string]interface{}{
				"code": "INTERNAL_SERVER_ERROR",
			},
		}
	}

	return &event, nil
}

// EventByName is the resolver for the eventByName field.
func (r *queryResolver) EventByName(ctx context.Context, name string) (*model.Event, error) {
	query := `
		SELECT id, name, description, start_date, end_date, location, created_at, updated_at, created_by, updated_by
		FROM events
		WHERE name = ?
	`
	row := r.DB.QueryRow(query, name)
	var event model.Event

	if err := row.Scan(
		&event.ID,
		&event.Name,
		&event.Description,
		&event.StartDate,
		&event.EndDate,
		&event.Location,
		&event.CreatedAt,
		&event.UpdatedAt,
		&event.CreatedBy,
		&event.UpdatedBy,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("event not found")
		}
		log.Printf("failed to query event by name: %v", err)

		return nil, &gqlerror.Error{
			Message: "イベントの取得中にサーバーエラーが発生しました。",
			Extensions: map[string]interface{}{
				"code": "INTERNAL_SERVER_ERROR",
			},
		}
	}

	return &event, nil
}

// Event returns graph.EventResolver implementation.
func (r *Resolver) Event() graph.EventResolver { return &eventResolver{r} }

// Mutation returns graph.MutationResolver implementation.
func (r *Resolver) Mutation() graph.MutationResolver { return &mutationResolver{r} }

// Query returns graph.QueryResolver implementation.
func (r *Resolver) Query() graph.QueryResolver { return &queryResolver{r} }

type eventResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
