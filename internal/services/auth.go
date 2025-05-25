package services

import (
	"crypto/sha256"
	"encoding/hex"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/grewalsk/task-api/internal/middleware"
	"github.com/grewalsk/task-api/internal/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthService struct {
	jwtSecret string
	expiryHours int
}

func NewAuthService(jwtSecret string, expiryHours int) *AuthService {
	return &AuthService{
		jwtSecret:   jwtSecret,
		expiryHours: expiryHours,
	}
}

func (s *AuthService) HashPassword(password string) string {
	hash := sha256.Sum256([]byte(password))
	return hex.EncodeToString(hash[:])
}

func (s *AuthService) VerifyPassword(password, hash string) bool {
	return s.HashPassword(password) == hash
}

func (s *AuthService) GenerateToken(userID primitive.ObjectID, role string) (string, error) {
	claims := &middleware.Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.expiryHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) CreateDefaultUser() *models.User {
	userID := primitive.NewObjectID()
	return &models.User{
		ID:        userID,
		Email:     "admin@example.com",
		Password:  s.HashPassword("admin123"),
		Role:      models.RoleAdmin,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}