package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Claims struct {
	UserID primitive.ObjectID `json:"user_id"`
	Role   string             `json:"role"`
	jwt.RegisteredClaims
}

type contextKey string

const UserContextKey contextKey = "user"

func JWTAuth(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"error":"missing_authorization","message":"Authorization header required"}`, http.StatusUnauthorized)
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == authHeader {
				http.Error(w, `{"error":"invalid_authorization","message":"Bearer token required"}`, http.StatusUnauthorized)
				return
			}

			token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				http.Error(w, `{"error":"invalid_token","message":"Invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(*Claims)
			if !ok {
				http.Error(w, `{"error":"invalid_claims","message":"Invalid token claims"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUserFromContext(ctx context.Context) (*Claims, bool) {
	user, ok := ctx.Value(UserContextKey).(*Claims)
	return user, ok
}