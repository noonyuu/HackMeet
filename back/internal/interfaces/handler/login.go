package handler

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/noonyuu/nfc/back/graph/model"
	"github.com/noonyuu/nfc/back/graph/resolver"
	"github.com/noonyuu/nfc/back/internal/config"
	"github.com/noonyuu/nfc/back/internal/usecase"

	"github.com/gin-gonic/gin"
	"github.com/markbates/goth/gothic"
)

// プロバイダー名をコンテキストに保存
func ContextWithProviderName(ctx *gin.Context, provider string) *http.Request {
	return ctx.Request.WithContext(context.WithValue(ctx.Request.Context(), "provider", provider))
}

type AuthController struct {
	authUseCase    usecase.AuthUsecase
	sessionUseCase usecase.SessionUsecase
	graphql        *resolver.Resolver
}

func NewAuthController(authUseCase usecase.AuthUsecase, sessionUseCase usecase.SessionUsecase, graphql *resolver.Resolver) *AuthController {
	return &AuthController{authUseCase: authUseCase, sessionUseCase: sessionUseCase, graphql: graphql}
}

// 期限を定数で定義
const (
	// アクセストークンの有効期限
	AccessTokenExpireTime = 15 * time.Minute
	// リフレッシュトークンの有効期限
	RefreshTokenExpireTime = 30 * 24 * time.Hour // 30日
)

func (u *AuthController) GetAuthCallbackFunction(c *gin.Context) {
	log.Print("getAuthCallbackFunction")
	ctx := c.Request.Context()
	provider := c.Param("provider")
	c.Request = ContextWithProviderName(c, provider)

	// 認証情報を取得
	userGoth, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ユーザーデータをDTO形式に変換
	userData := &usecase.CreateUserDTO{
		Name:      userGoth.Name,
		Email:     userGoth.Email,
		AvatarURL: userGoth.AvatarURL,
	}

	// ユーザーがすでに存在するかを確認
	existingUser, err := u.authUseCase.FindByEmail(ctx, userGoth.Email, userGoth.UserID, userGoth.Provider)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var userRes *model.User

	if err == nil && existingUser != nil {
		// ユーザーが存在する場合は作成しない
		userRes = existingUser
	} else {
		// ユーザーが存在しない場合は新規作成
		userRes, err = u.authUseCase.Create(ctx, userData, userGoth)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// アクセストークンとリフレッシュトークンを生成
	accessToken, err := config.GenerateAccessToken(userRes.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	refreshToken, err := config.GenerateRefreshToken(userRes.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	// リフレッシュトークンをRedisに保存
	_, err = u.sessionUseCase.Save(ctx, "refresh_token:"+userRes.ID, refreshToken, RefreshTokenExpireTime) // 30日間有効
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save refresh token"})
		return
	}

	// クッキーにセット
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		HttpOnly: true,
		Secure:   false, // 本番環境では true にする
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   60 * 15, // 15分
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   false, // 本番環境では true にする
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 30, // 30日
	})

	c.Redirect(http.StatusFound, os.Getenv("HOST_URL"))
}

func (u *AuthController) RefreshAccessToken(c *gin.Context) {
	ctx := c.Request.Context()

	// リフレッシュトークンをクッキーから取得
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		// リクエストボディからも取得を試みる
		refreshToken = c.PostForm("refresh_token")
		if refreshToken == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing refresh token"})
			return
		}
	}

	// リフレッシュトークンを検証
	claims, err := config.ParseToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	userID := claims.Id

	// Redisに保存されているリフレッシュトークンと一致するか確認
	storedToken, err := u.sessionUseCase.Get(ctx, "refresh_token:"+userID)
	if err != nil || storedToken.Value != refreshToken {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	// graphqlサーバからユーザー情報を取得
	userInfo, err := u.graphql.Query().ProfileByUserID(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}

	// 新しいアクセストークンを生成
	newAccessToken, err := config.GenerateAccessToken(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new access token"})
		return
	}

	// クッキーを更新 - session_idは不要
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    newAccessToken,
		HttpOnly: true,
		Secure:   false, // 本番環境では true にする
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   60 * 15, // 15分
	})

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessToken,
		"user": gin.H{
			"id":              userInfo.ID,
			"nick_name":       userInfo.NickName,
			"avatar_url":      userInfo.AvatarURL,
			"graduation_year": userInfo.GraduationYear,
			"affiliation":     userInfo.Affiliation,
			"bio":             userInfo.Bio,
		},
	})
	return
}

func (u *AuthController) GetUserAfterAuthorization(c *gin.Context) {
	log.Print("GetUserAfterAuthorization")
	ctx := c.Request.Context()

	// アクセストークンからユーザー情報を取得
	accessToken, err := c.Cookie("access_token")
	if err == nil && accessToken != "" {
		claims, err := config.ParseToken(accessToken)
		if err == nil {
			userID := claims.Id
			// graphqlサーバからユーザー情報を取得
			userInfo, err := u.graphql.Query().ProfileByUserID(ctx, userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
				return
			}
			// 新しいアクセストークンを生成
			newAccessToken, err := config.GenerateAccessToken(userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new access token"})
				return
			}

			// クッキーを更新
			http.SetCookie(c.Writer, &http.Cookie{
				Name:     "access_token",
				Value:    newAccessToken,
				HttpOnly: true,
				Secure:   false, // 本番環境では true にする
				SameSite: http.SameSiteLaxMode,
				Path:     "/",
				MaxAge:   60 * 15, // 15分
			})
			// ユーザー情報を返す
			c.JSON(http.StatusOK, gin.H{
				"id":              userInfo.ID,
				"nick_name":       userInfo.NickName,
				"avatar_url":      userInfo.AvatarURL,
				"graduation_year": userInfo.GraduationYear,
				"affiliation":     userInfo.Affiliation,
				"bio":             userInfo.Bio,
			})
			return
		}
	}

	// リフレッシュトークンで再ログインを試みる
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	// リフレッシュトークンを検証
	claims, err := config.ParseToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	userID := claims.Id

	// Redisに保存されているリフレッシュトークンと一致するか確認
	storedToken, err := u.sessionUseCase.Get(ctx, "refresh_token:"+userID)
	if err != nil || storedToken.Value != refreshToken {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	} else {
		// graphqlサーバからユーザー情報を取得
		userInfo, err := u.graphql.Query().ProfileByUserID(ctx, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
			return
		}
		// 新しいアクセストークンを生成
		newAccessToken, err := config.GenerateAccessToken(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new access token"})
			return
		}

		// クッキーを更新
		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "access_token",
			Value:    newAccessToken,
			HttpOnly: true,
			Secure:   false, // 本番環境では true にする
			SameSite: http.SameSiteLaxMode,
			Path:     "/",
			MaxAge:   60 * 15, // 15分
		})
		// ユーザー情報を返す
		c.JSON(http.StatusOK, gin.H{
			"id": userInfo.ID,
		})
		return
	}
}

// ログアウト処理
func (u *AuthController) Logout(c *gin.Context) {
	log.Print("Logout")
	ctx := c.Request.Context()

	// アクセストークンからユーザーIDを取得
	accessToken, err := c.Cookie("access_token")
	if err == nil && accessToken != "" {
		claims, err := config.ParseToken(accessToken)
		if err == nil {
			userID := claims.Id

			// リフレッシュトークンをRedisから削除
			u.sessionUseCase.Delete(ctx, "refresh_token:"+userID)
		}
	}

	// クッキーを削除
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   -1,
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   -1,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}
