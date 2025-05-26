package auth

import (
	"log"
	"os"

	"github.com/noonyuu/nfc/back/internal/config"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
)

const (
	MaxAge = 86400 * 30
	IsProd = false
)

func NewAuth() {
	config.LoadEnv()

	googleClientId := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	githubClientId := os.Getenv("GITHUB_CLIENT_ID")
	githubClientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	sessionSecret := os.Getenv("SESSION_SECRET")

	if sessionSecret == "" {
		log.Fatal("SESSION_SECRET is not set")
	}

	store := sessions.NewCookieStore([]byte(sessionSecret))
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   MaxAge,
		HttpOnly: true,
		Secure:   IsProd,
	}
	gothic.Store = store

	hostUrl := os.Getenv("HOST_URL")

	goth.UseProviders(
		google.New(googleClientId, googleClientSecret, hostUrl+"api/v1/auth/google/callback", "email", "profile"),
		github.New(githubClientId, githubClientSecret, hostUrl+"api/v1/auth/github/callback", "user:email", "read:user"),
	)
}
