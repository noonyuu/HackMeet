package config

import (
	"fmt"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
)

var jwtSecretKey = []byte(os.Getenv("JWT_SECRET"))

// カスタムクレーム構造体
type CustomClaims struct {
	jwt.StandardClaims
	Id string `json:"id"` // ユーザーID
}

// アクセストークンを生成する関数
func GenerateAccessToken(userID string) (string, error) {
	// トークンのペイロード
	claims := &CustomClaims{
		StandardClaims: jwt.StandardClaims{
			Issuer:    "nfc-auth",                              // 発行者
			IssuedAt:  time.Now().Unix(),                       // 発行時間
			ExpiresAt: time.Now().Add(15 * time.Minute).Unix(), // 有効期限（15分）
		},
		Id: userID,
	}

	// JWTトークンを生成
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// トークンを署名して文字列を生成
	signedToken, err := token.SignedString(jwtSecretKey)
	if err != nil {
		return "", err
	}

	return signedToken, nil
}

// リフレッシュトークンの生成関数
func GenerateRefreshToken(userID string) (string, error) {
	// リフレッシュトークンのペイロード
	claims := &CustomClaims{
		StandardClaims: jwt.StandardClaims{
			Issuer:    "nfc-auth",                                 // 発行者
			IssuedAt:  time.Now().Unix(),                          // 発行時間
			ExpiresAt: time.Now().Add(30 * 24 * time.Hour).Unix(), // 有効期限（30日）
		},
		Id: userID,
	}

	// JWTトークンを生成
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// トークンを署名して文字列を生成
	signedToken, err := token.SignedString(jwtSecretKey)
	if err != nil {
		return "", err
	}

	return signedToken, nil
}

// JWTトークンを解析してクレームを取得する関数
func ParseToken(tokenString string) (*CustomClaims, error) {
	// JWTトークンの解析
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		// 署名の検証に使用する秘密鍵を返す
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecretKey, nil
	})

	if err != nil {
		return nil, err
	}

	// クレームを取得
	claims, ok := token.Claims.(*CustomClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}
