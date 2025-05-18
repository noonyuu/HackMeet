package resolver

//go:generate go run github.com/99designs/gqlgen generate
import (
	"github.com/jmoiron/sqlx"
	"github.com/noonyuu/nfc/back/graph/model"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB       *sqlx.DB
	user     *model.User
	users    []*model.User
	profile  *model.Profile
	profiles []*model.Profile
	event    *model.Event
	events   []*model.Event
	work     *model.Work
	works    []*model.Work
}
