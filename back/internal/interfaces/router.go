package interfaces

import (
	"net/http"

	"github.com/noonyuu/nfc/back/internal/interfaces/handler"

	"github.com/gin-gonic/gin"
	"github.com/markbates/goth/gothic"
)

func NewRouter(userHandler *handler.AuthController) http.Handler {
	r := gin.Default()

	r.Use(newCORS())

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"messages": "ping /ping"})
	})

	v1 := r.Group("/api/v1/auth")
	{
		v1.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"messages": "ping /api/v1/auth"})
		})
		v1.GET("/:provider", func(c *gin.Context) {
			provider := c.Param("provider")
			c.Request = handler.ContextWithProviderName(c, provider)
			gothic.BeginAuthHandler(c.Writer, c.Request)
		})
		v1.GET("/:provider/callback", userHandler.GetAuthCallbackFunction)
		v1.GET("/getUser", userHandler.GetUserAfterAuthorization)
		v1.GET("/logout/:provider", func(c *gin.Context) {
			gothic.Logout(c.Writer, c.Request)
			c.Redirect(http.StatusTemporaryRedirect, "/")
		})
		v1.POST("/refresh", userHandler.RefreshAccessToken)
	}

	return r
}

func newCORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}
		c.Next()
	}
}
