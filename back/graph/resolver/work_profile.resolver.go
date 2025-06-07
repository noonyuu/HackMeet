package resolver

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/noonyuu/nfc/back/graph"
	"github.com/noonyuu/nfc/back/graph/model"
)

// CreateWorkProfile is the resolver for the createWorkProfile field.
func (r *mutationResolver) CreateWorkProfile(ctx context.Context, input model.NewWorkProfile) (*model.WorkProfile, error) {
	now := time.Now()
	workProfile := &model.WorkProfile{
		WorkID:    input.WorkID,
		ProfileID: input.ProfileID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	query := `
		INSERT INTO work_profiles (work_id, profile_id, created_at, updated_at)
		VALUES (?, ?, ?, ?)
	`
	_, err := r.DB.ExecContext(ctx, query, workProfile.WorkID, workProfile.ProfileID, now, now)
	if err != nil {
		return nil, fmt.Errorf("failed to create work profile: %w", err)
	}

	return workProfile, nil
}

// DeleteWorkProfile is the resolver for the deleteWorkProfile field.
func (r *mutationResolver) DeleteWorkProfile(ctx context.Context, id int32) (*model.WorkProfile, error) {
	query := `
		DELETE FROM work_profiles WHERE id = ?
	`
	result, err := r.DB.ExecContext(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete work profile: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return nil, fmt.Errorf("work profile with ID %d not found", id)
	}

	return &model.WorkProfile{ID: id}, nil
}

// WorkProfile is the resolver for the workProfile field.
func (r *queryResolver) WorkProfile(ctx context.Context, id int32) (*model.WorkProfile, error) {
	query := `
		SELECT wp.id, wp.work_id, wp.profile_id, wp.created_at, wp.updated_at,
			w.id, w.title, w.description, w.created_at, w.updated_at, w.event_id,
			p.id, p.avatar_url, p.nick_name, p.graduation_year, p.affiliation, p.bio
		FROM work_profiles wp
		JOIN works w ON wp.work_id = w.id
		JOIN profiles p ON wp.profile_id = p.id
		WHERE wp.id = ?
	`

	row := r.DB.QueryRowContext(ctx, query, id)

	wp := &model.WorkProfile{}
	work := &model.Work{}
	profile := &model.Profile{}

	var workEventID sql.NullString
	var profileGraduationYear sql.NullInt32
	var profileAffiliation sql.NullString
	var profileBio sql.NullString

	err := row.Scan(
		&wp.ID, &wp.WorkID, &wp.ProfileID, &wp.CreatedAt, &wp.UpdatedAt,
		&work.ID, &work.Title, &work.Description, &work.CreatedAt, &work.UpdatedAt, &workEventID,
		&profile.ID, &profile.AvatarURL, &profile.NickName, &profileGraduationYear,
		&profileAffiliation, &profileBio,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("work profile with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to scan work profile: %w", err)
	}

	if workEventID.Valid {
		work.EventID = &workEventID.String
	}
	if profileGraduationYear.Valid {
		profile.GraduationYear = &profileGraduationYear.Int32
	}
	if profileAffiliation.Valid {
		profile.Affiliation = &profileAffiliation.String
	}
	if profileBio.Valid {
		profile.Bio = &profileBio.String
	}

	// Work に紐づくスキルを取得してセット
	skillsQuery := `
		SELECT s.id, s.name, s.created_at, s.updated_at
		FROM skills s
		INNER JOIN work_skills ws ON s.id = ws.skill_id
		WHERE ws.work_id = ?
	`
	skillRows, err := r.DB.QueryContext(ctx, skillsQuery, work.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to query skills for work %s: %w", work.ID, err)
	}
	defer skillRows.Close()

	var skills []model.Skill
	for skillRows.Next() {
		skill := model.Skill{}
		if err := skillRows.Scan(&skill.ID, &skill.Name, &skill.CreatedAt, &skill.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan skill for work %s: %w", work.ID, err)
		}
		skills = append(skills, skill)
	}
	if err = skillRows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating skill rows for work %s: %w", work.ID, err)
	}
	work.Skills = skills

	// Work に紐づく画像を取得してセット
	imageQuery := `
		SELECT i.id, i.image_url, i.created_at, i.updated_at
		FROM images i
		JOIN work_images wi ON i.id = wi.image_id
		WHERE wi.work_id = ?
	`
	imageRows, err := r.DB.QueryContext(ctx, imageQuery, work.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to query images for work %s: %w", work.ID, err)
	}
	defer imageRows.Close()

	var images []*model.Image
	var imageIDs []string // For work.ImageID
	for imageRows.Next() {
		img := &model.Image{}
		if err := imageRows.Scan(&img.ID, &img.ImageURL, &img.CreatedAt, &img.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan image for work %s: %w", work.ID, err)
		}
		images = append(images, img)
		imageIDs = append(imageIDs, img.ID)
	}
	if err = imageRows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating image rows for work %s: %w", work.ID, err)
	}
	work.Images = images
	work.ImageID = imageIDs

	// Work に紐づく図表画像を取得してセット
	diagramImageQuery := `
		SELECT di.id, di.image_url, di.created_at, di.updated_at
		FROM diagram_images di
		JOIN work_diagram_images wdi ON di.id = wdi.diagram_image_id
		WHERE wdi.work_id = ?
	`
	diagramImageRows, err := r.DB.QueryContext(ctx, diagramImageQuery, work.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to query diagram images for work %s: %w", work.ID, err)
	}
	defer diagramImageRows.Close()

	var diagramImages []*model.DiagramImage
	var diagramImageURLs []*string // For work.DiagramImageID
	for diagramImageRows.Next() {
		diagImg := &model.DiagramImage{}
		if err := diagramImageRows.Scan(&diagImg.ID, &diagImg.ImageURL, &diagImg.CreatedAt, &diagImg.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan diagram image for work %s: %w", work.ID, err)
		}
		diagramImages = append(diagramImages, diagImg)
		diagramImageURLs = append(diagramImageURLs, &diagImg.ImageURL)
	}
	if err = diagramImageRows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating diagram image rows for work %s: %w", work.ID, err)
	}
	work.DiagramImages = diagramImages
	work.DiagramImageID = diagramImageURLs

	// Work に紐づくユーザーIDを取得してセット
	userIDsQuery := `SELECT profile_id FROM work_profiles WHERE work_id = ?`
	userIDRows, err := r.DB.QueryContext(ctx, userIDsQuery, work.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to query user IDs for work %s: %w", work.ID, err)
	}
	defer userIDRows.Close()

	var userIDs []string
	for userIDRows.Next() {
		var userID string
		if err := userIDRows.Scan(&userID); err != nil {
			return nil, fmt.Errorf("failed to scan user ID for work %s: %w", work.ID, err)
		}
		userIDs = append(userIDs, userID)
	}
	if err = userIDRows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user ID rows for work %s: %w", work.ID, err)
	}
	work.UserIDs = userIDs

	// Work に紐づくイベントを取得してセット
	eventQuery := `
		SELECT e.id, e.name, e.created_at, e.updated_at
		FROM events e
		JOIN work_events we ON e.id = we.event_id
		WHERE we.work_id = ?
	`
	eventRows, err := r.DB.QueryContext(ctx, eventQuery, work.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to query events for work %s: %w", work.ID, err)
	}
	defer eventRows.Close()

	var events []*model.Event
	for eventRows.Next() {
		event := &model.Event{}
		if err := eventRows.Scan(&event.ID, &event.Name, &event.CreatedAt, &event.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan event for work %s: %w", work.ID, err)
		}
		events = append(events, event)
	}
	if err = eventRows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating event rows for work %s: %w", work.ID, err)
	}
	work.Events = events

	wp.Work = work
	wp.Profile = profile

	return wp, nil
}

// WorkProfilesByWorkID is the resolver for the workProfilesByWorkId field.
func (r *queryResolver) WorkProfilesByWorkID(ctx context.Context, workID string) ([]*model.WorkProfile, error) {
	query := `
		SELECT id, work_id, profile_id, created_at, updated_at
		FROM work_profiles
		WHERE work_id = ?
	`
	rows, err := r.DB.QueryContext(ctx, query, workID)
	if err != nil {
		return nil, fmt.Errorf("failed to query work profiles by work ID: %w", err)
	}
	defer rows.Close()

	var workProfiles []*model.WorkProfile
	for rows.Next() {
		workProfile := &model.WorkProfile{}
		if err := rows.Scan(&workProfile.ID, &workProfile.WorkID, &workProfile.ProfileID, &workProfile.CreatedAt, &workProfile.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan work profile: %w", err)
		}

		// Work と Profile オブジェクトを直接ロード
		workQuery := `
			SELECT id, title, description, created_at, updated_at, event_id
			FROM works
			WHERE id = ?
		`
		work := &model.Work{}
		var eventID sql.NullString
		if err := r.DB.QueryRowContext(ctx, workQuery, workProfile.WorkID).Scan(&work.ID, &work.Title, &work.Description, &work.CreatedAt, &work.UpdatedAt, &eventID); err != nil {
			return nil, fmt.Errorf("failed to scan work for work profile %d: %w", workProfile.ID, err)
		}
		if eventID.Valid {
			work.EventID = &eventID.String
		}

		// ここで Work の関連データも取得する (Skills, Images, DiagramImages, UserIDs, Events)
		// スキルをロード
		skillsQuery := `
			SELECT s.id, s.name, s.created_at, s.updated_at
			FROM skills s
			INNER JOIN work_skills ws ON s.id = ws.skill_id
			WHERE ws.work_id = ?
		`
		skillRows, err := r.DB.QueryContext(ctx, skillsQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query skills for work %s: %w", work.ID, err)
		}
		defer skillRows.Close()

		var skills []model.Skill
		for skillRows.Next() {
			skill := model.Skill{}
			if err := skillRows.Scan(&skill.ID, &skill.Name, &skill.CreatedAt, &skill.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan skill for work %s: %w", work.ID, err)
			}
			skills = append(skills, skill)
		}
		if err = skillRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating skill rows for work %s: %w", work.ID, err)
		}
		work.Skills = skills

		// Work に紐づく画像を取得してセット
		imageQuery := `
			SELECT i.id, i.image_url, i.created_at, i.updated_at
			FROM images i
			JOIN work_images wi ON i.id = wi.image_id
			WHERE wi.work_id = ?
		`
		imageRows, err := r.DB.QueryContext(ctx, imageQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query images for work %s: %w", work.ID, err)
		}
		defer imageRows.Close()

		var images []*model.Image
		var imageIDs []string // For work.ImageID
		for imageRows.Next() {
			img := &model.Image{}
			if err := imageRows.Scan(&img.ID, &img.ImageURL, &img.CreatedAt, &img.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan image for work %s: %w", work.ID, err)
			}
			images = append(images, img)
			imageIDs = append(imageIDs, img.ID)
		}
		if err = imageRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating image rows for work %s: %w", work.ID, err)
		}
		work.Images = images
		work.ImageID = imageIDs

		// Work に紐づく図表画像を取得してセット
		diagramImageQuery := `
			SELECT di.id, di.image_url, di.created_at, di.updated_at
			FROM diagram_images di
			JOIN work_diagram_images wdi ON di.id = wdi.diagram_image_id
			WHERE wdi.work_id = ?
		`
		diagramImageRows, err := r.DB.QueryContext(ctx, diagramImageQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query diagram images for work %s: %w", work.ID, err)
		}
		defer diagramImageRows.Close()

		var diagramImages []*model.DiagramImage
		var diagramImageURLs []*string // For work.DiagramImageID
		for diagramImageRows.Next() {
			diagImg := &model.DiagramImage{}
			if err := diagramImageRows.Scan(&diagImg.ID, &diagImg.ImageURL, &diagImg.CreatedAt, &diagImg.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan diagram image for work %s: %w", work.ID, err)
			}
			diagramImages = append(diagramImages, diagImg)
			diagramImageURLs = append(diagramImageURLs, &diagImg.ImageURL)
		}
		if err = diagramImageRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating diagram image rows for work %s: %w", work.ID, err)
		}
		work.DiagramImages = diagramImages
		work.DiagramImageID = diagramImageURLs

		// Work に紐づくユーザーIDを取得してセット
		workUserIDsQuery := `SELECT profile_id FROM work_profiles WHERE work_id = ?`
		workUserIDRows, err := r.DB.QueryContext(ctx, workUserIDsQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query user IDs for work %s: %w", work.ID, err)
		}
		defer workUserIDRows.Close()

		var workUserIDs []string
		for workUserIDRows.Next() {
			var userID string
			if err := workUserIDRows.Scan(&userID); err != nil {
				return nil, fmt.Errorf("failed to scan user ID for work %s: %w", work.ID, err)
			}
			workUserIDs = append(workUserIDs, userID)
		}
		if err = workUserIDRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating user ID rows for work %s: %w", work.ID, err)
		}
		work.UserIDs = workUserIDs

		// Work に紐づくイベントを取得してセット
		workEventQuery := `
			SELECT e.id, e.name, e.created_at, e.updated_at
			FROM events e
			JOIN work_events we ON e.id = we.event_id
			WHERE we.work_id = ?
		`
		workEventRows, err := r.DB.QueryContext(ctx, workEventQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query events for work %s: %w", work.ID, err)
		}
		defer workEventRows.Close()

		var workEvents []*model.Event
		for workEventRows.Next() {
			event := &model.Event{}
			if err := workEventRows.Scan(&event.ID, &event.Name, &event.CreatedAt, &event.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan event for work %s: %w", work.ID, err)
			}
			workEvents = append(workEvents, event)
		}
		if err = workEventRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating event rows for work %s: %w", work.ID, err)
		}
		work.Events = workEvents

		profileQuery := `
			SELECT id, avatar_url, nick_name, graduation_year, affiliation, bio, created_at, updated_at
			FROM profiles
			WHERE id = ?
		`
		profile := &model.Profile{}
		var graduationYear sql.NullInt32
		var affiliation, bio sql.NullString
		if err := r.DB.QueryRowContext(ctx, profileQuery, workProfile.ProfileID).Scan(
			&profile.ID, &profile.AvatarURL, &profile.NickName, &graduationYear, &affiliation, &bio, &profile.CreatedAt, &profile.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan profile for work profile %d: %w", workProfile.ID, err)
		}
		if graduationYear.Valid {
			profile.GraduationYear = &graduationYear.Int32
		}
		if affiliation.Valid {
			profile.Affiliation = &affiliation.String
		}
		if bio.Valid {
			profile.Bio = &bio.String
		}
		workProfile.Work = work
		workProfile.Profile = profile
		workProfiles = append(workProfiles, workProfile)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating work profiles: %w", err)
	}

	return workProfiles, nil
}

// WorkProfilesByProfileID is the resolver for the workProfilesByProfileId field.
func (r *queryResolver) WorkProfilesByProfileID(ctx context.Context, profileID string) ([]*model.WorkProfile, error) {
	query := `
		SELECT id, work_id, profile_id, created_at, updated_at
		FROM work_profiles
		WHERE profile_id = ?
	`
	rows, err := r.DB.QueryContext(ctx, query, profileID)
	if err != nil {
		return nil, fmt.Errorf("failed to query work profiles by profile ID: %w", err)
	}
	defer rows.Close()

	var workProfiles []*model.WorkProfile
	for rows.Next() {
		workProfile := &model.WorkProfile{}
		if err := rows.Scan(&workProfile.ID, &workProfile.WorkID, &workProfile.ProfileID, &workProfile.CreatedAt, &workProfile.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan work profile: %w", err)
		}

		// Work と Profile オブジェクトを直接ロード
		workQuery := `
			SELECT id, title, description, created_at, updated_at, event_id
			FROM works
			WHERE id = ?
		`
		work := &model.Work{}
		var eventID sql.NullString
		if err := r.DB.QueryRowContext(ctx, workQuery, workProfile.WorkID).Scan(&work.ID, &work.Title, &work.Description, &work.CreatedAt, &work.UpdatedAt, &eventID); err != nil {
			return nil, fmt.Errorf("failed to scan work for work profile %d: %w", workProfile.ID, err)
		}
		if eventID.Valid {
			work.EventID = &eventID.String
		}

		// ここで Work の関連データも取得する (Skills, Images, DiagramImages, UserIDs, Events)
		// スキルをロード
		skillsQuery := `
			SELECT s.id, s.name, s.created_at, s.updated_at
			FROM skills s
			INNER JOIN work_skills ws ON s.id = ws.skill_id
			WHERE ws.work_id = ?
		`
		skillRows, err := r.DB.QueryContext(ctx, skillsQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query skills for work %s: %w", work.ID, err)
		}
		defer skillRows.Close()

		var skills []model.Skill
		for skillRows.Next() {
			skill := model.Skill{}
			if err := skillRows.Scan(&skill.ID, &skill.Name, &skill.CreatedAt, &skill.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan skill for work %s: %w", work.ID, err)
			}
			skills = append(skills, skill)
		}
		if err = skillRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating skill rows for work %s: %w", work.ID, err)
		}
		work.Skills = skills

		// Work に紐づく画像を取得してセット
		imageQuery := `
			SELECT i.id, i.image_url, i.created_at, i.updated_at
			FROM images i
			JOIN work_images wi ON i.id = wi.image_id
			WHERE wi.work_id = ?
		`
		imageRows, err := r.DB.QueryContext(ctx, imageQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query images for work %s: %w", work.ID, err)
		}
		defer imageRows.Close()

		var images []*model.Image
		var imageIDs []string // For work.ImageID
		for imageRows.Next() {
			img := &model.Image{}
			if err := imageRows.Scan(&img.ID, &img.ImageURL, &img.CreatedAt, &img.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan image for work %s: %w", work.ID, err)
			}
			images = append(images, img)
			imageIDs = append(imageIDs, img.ID)
		}
		if err = imageRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating image rows for work %s: %w", work.ID, err)
		}
		work.Images = images
		work.ImageID = imageIDs

		// Work に紐づく図表画像を取得してセット
		diagramImageQuery := `
			SELECT di.id, di.image_url, di.created_at, di.updated_at
			FROM diagram_images di
			JOIN work_diagram_images wdi ON di.id = wdi.diagram_image_id
			WHERE wdi.work_id = ?
		`
		diagramImageRows, err := r.DB.QueryContext(ctx, diagramImageQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query diagram images for work %s: %w", work.ID, err)
		}
		defer diagramImageRows.Close()

		var diagramImages []*model.DiagramImage
		var diagramImageURLs []*string // For work.DiagramImageID
		for diagramImageRows.Next() {
			diagImg := &model.DiagramImage{}
			if err := diagramImageRows.Scan(&diagImg.ID, &diagImg.ImageURL, &diagImg.CreatedAt, &diagImg.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan diagram image for work %s: %w", work.ID, err)
			}
			diagramImages = append(diagramImages, diagImg)
			diagramImageURLs = append(diagramImageURLs, &diagImg.ImageURL)
		}
		if err = diagramImageRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating diagram image rows for work %s: %w", work.ID, err)
		}
		work.DiagramImages = diagramImages
		work.DiagramImageID = diagramImageURLs

		// Work に紐づくユーザーIDを取得してセット
		workUserIDsQuery := `SELECT profile_id FROM work_profiles WHERE work_id = ?`
		workUserIDRows, err := r.DB.QueryContext(ctx, workUserIDsQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query user IDs for work %s: %w", work.ID, err)
		}
		defer workUserIDRows.Close()

		var workUserIDs []string
		for workUserIDRows.Next() {
			var userID string
			if err := workUserIDRows.Scan(&userID); err != nil {
				return nil, fmt.Errorf("failed to scan user ID for work %s: %w", work.ID, err)
			}
			workUserIDs = append(workUserIDs, userID)
		}
		if err = workUserIDRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating user ID rows for work %s: %w", work.ID, err)
		}
		work.UserIDs = workUserIDs

		// Work に紐づくイベントを取得してセット
		workEventQuery := `
			SELECT e.id, e.name, e.created_at, e.updated_at
			FROM events e
			JOIN work_events we ON e.id = we.event_id
			WHERE we.work_id = ?
		`
		workEventRows, err := r.DB.QueryContext(ctx, workEventQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query events for work %s: %w", work.ID, err)
		}
		defer workEventRows.Close()

		var workEvents []*model.Event
		for workEventRows.Next() {
			event := &model.Event{}
			if err := workEventRows.Scan(&event.ID, &event.Name, &event.CreatedAt, &event.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan event for work %s: %w", work.ID, err)
			}
			workEvents = append(workEvents, event)
		}
		if err = workEventRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating event rows for work %s: %w", work.ID, err)
		}
		work.Events = workEvents

		profileQuery := `
			SELECT id, avatar_url, nick_name, graduation_year, affiliation, bio, created_at, updated_at
			FROM profiles
			WHERE id = ?
		`
		profile := &model.Profile{}
		var graduationYear sql.NullInt32
		var affiliation, bio sql.NullString
		if err := r.DB.QueryRowContext(ctx, profileQuery, workProfile.ProfileID).Scan(
			&profile.ID, &profile.AvatarURL, &profile.NickName, &graduationYear, &affiliation, &bio, &profile.CreatedAt, &profile.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan profile for work profile %d: %w", workProfile.ID, err)
		}
		if graduationYear.Valid {
			profile.GraduationYear = &graduationYear.Int32
		}
		if affiliation.Valid {
			profile.Affiliation = &affiliation.String
		}
		if bio.Valid {
			profile.Bio = &bio.String
		}
		workProfile.Work = work
		workProfile.Profile = profile
		workProfiles = append(workProfiles, workProfile)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating work profiles: %w", err)
	}

	return workProfiles, nil
}

// WorkProfilesByProfileID is the resolver for the workProfilesByProfileId field.

// WorksByProfileID is the resolver for the worksByProfileId field.
func (r *queryResolver) WorksByProfileID(ctx context.Context, profileID string) ([]*model.Work, error) {
	query := `
		SELECT w.id, w.title, w.description
		FROM work_profiles wp
		JOIN works w ON wp.work_id = w.id
		WHERE wp.profile_id = ?
	`

	rows, err := r.DB.QueryContext(ctx, query, profileID)
	if err != nil {
		return nil, fmt.Errorf("failed to query works by profile ID: %w", err)
	}
	defer rows.Close()

	var works []*model.Work
	for rows.Next() {
		work := &model.Work{}
		var eventID sql.NullString
		if err := rows.Scan(&work.ID, &work.Title, &work.Description); err != nil {
			return nil, fmt.Errorf("failed to scan work: %w", err)
		}
		if eventID.Valid {
			work.EventID = &eventID.String
		}

		// Work に紐づくスキル、画像、図表画像、ユーザーID、イベントを取得してセット
		skillsQuery := `
			SELECT s.id, s.name, s.created_at, s.updated_at
			FROM skills s
			INNER JOIN work_skills ws ON s.id = ws.skill_id
			WHERE ws.work_id = ?
		`
		skillRows, err := r.DB.QueryContext(ctx, skillsQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query skills for work %s: %w", work.ID, err)
		}
		defer skillRows.Close()

		var skills []model.Skill
		for skillRows.Next() {
			skill := model.Skill{}
			if err := skillRows.Scan(&skill.ID, &skill.Name, &skill.CreatedAt, &skill.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan skill for work %s: %w", work.ID, err)
			}
			skills = append(skills, skill)
		}
		if err = skillRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating skill rows for work %s: %w", work.ID, err)
		}
		work.Skills = skills

		// Work に紐づく画像を取得してセット
		imageQuery := `
			SELECT i.id, i.image_url, i.created_at, i.updated_at
			FROM images i
			JOIN work_images wi ON i.id = wi.image_id
			WHERE wi.work_id = ?
		`
		imageRows, err := r.DB.QueryContext(ctx, imageQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query images for work %s: %w", work.ID, err)
		}
		defer imageRows.Close()

		var images []*model.Image
		var imageIDs []string // For work.ImageID
		for imageRows.Next() {
			img := &model.Image{}
			if err := imageRows.Scan(&img.ID, &img.ImageURL, &img.CreatedAt, &img.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan image for work %s: %w", work.ID, err)
			}
			images = append(images, img)
			imageIDs = append(imageIDs, img.ID)
		}
		if err = imageRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating image rows for work %s: %w", work.ID, err)
		}
		work.Images = images
		work.ImageID = imageIDs

		// Work に紐づく図表画像を取得してセット
		diagramImageQuery := `
			SELECT di.id, di.image_url, di.created_at, di.updated_at
			FROM diagram_images di
			JOIN work_diagram_images wdi ON di.id = wdi.image_id
			WHERE wdi.work_id = ?
		`
		diagramImageRows, err := r.DB.QueryContext(ctx, diagramImageQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query diagram images for work %s: %w", work.ID, err)
		}
		defer diagramImageRows.Close()

		var diagramImages []*model.DiagramImage
		var diagramImageURLs []*string // For work.DiagramImageID
		for diagramImageRows.Next() {
			diagImg := &model.DiagramImage{}
			if err := diagramImageRows.Scan(&diagImg.ID, &diagImg.ImageURL, &diagImg.CreatedAt, &diagImg.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan diagram image for work %s: %w", work.ID, err)
			}
			diagramImages = append(diagramImages, diagImg)
			diagramImageURLs = append(diagramImageURLs, &diagImg.ImageURL)
		}
		if err = diagramImageRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating diagram image rows for work %s: %w", work.ID, err)
		}
		work.DiagramImages = diagramImages
		work.DiagramImageID = diagramImageURLs

		// Work に紐づくユーザーIDを取得してセット
		userIDsQuery := `SELECT profile_id FROM work_profiles WHERE work_id = ?`
		userIDRows, err := r.DB.QueryContext(ctx, userIDsQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query user IDs for work %s: %w", work.ID, err)
		}
		defer userIDRows.Close()

		var userIDs []string
		for userIDRows.Next() {
			var userID string
			if err := userIDRows.Scan(&userID); err != nil {
				return nil, fmt.Errorf("failed to scan user ID for work %s: %w", work.ID, err)
			}
			userIDs = append(userIDs, userID)
		}
		if err = userIDRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating user ID rows for work %s: %w", work.ID, err)
		}
		work.UserIDs = userIDs

		// Work に紐づくイベントを取得してセット
		eventQuery := `
			SELECT e.id, e.name, e.created_at, e.updated_at
			FROM events e
			JOIN work_events we ON e.id = we.event_id
			WHERE we.work_id = ?
		`
		eventRows, err := r.DB.QueryContext(ctx, eventQuery, work.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to query events for work %s: %w", work.ID, err)
		}
		defer eventRows.Close()

		var events []*model.Event
		for eventRows.Next() {
			event := &model.Event{}
			if err := eventRows.Scan(&event.ID, &event.Name, &event.CreatedAt, &event.UpdatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan event for work %s: %w", work.ID, err)
			}
			events = append(events, event)
		}
		if err = eventRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating event rows for work %s: %w", work.ID, err)
		}
		work.Events = events

		works = append(works, work)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating works: %w", err)
	}

	return works, nil
}

// CreatedAt is the resolver for the createdAt field.
func (r *workProfileResolver) CreatedAt(ctx context.Context, obj *model.WorkProfile) (string, error) {
	return obj.CreatedAt.Format(time.RFC3339), nil
}

// UpdatedAt is the resolver for the updatedAt field.
func (r *workProfileResolver) UpdatedAt(ctx context.Context, obj *model.WorkProfile) (string, error) {
	return obj.UpdatedAt.Format(time.RFC3339), nil
}

// WorkProfile returns graph.WorkProfileResolver implementation.
func (r *Resolver) WorkProfile() graph.WorkProfileResolver { return &workProfileResolver{r} }

type workProfileResolver struct{ *Resolver }
