package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/grewalsk/task-api/internal/models"
	"github.com/grewalsk/task-api/internal/services"
	"github.com/grewalsk/task-api/internal/utils"
	"go.uber.org/zap"
)

type AuthHandler struct {
	authService *services.AuthService
	logger      *zap.Logger
}

func NewAuthHandler(authService *services.AuthService, logger *zap.Logger) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		logger:      logger,
	}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid_request", "Invalid JSON")
		return
	}

	if err := utils.ValidateStruct(req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "validation_error", utils.FormatValidationError(err))
		return
	}

	user := h.authService.CreateDefaultUser()
	if req.Email != user.Email || !h.authService.VerifyPassword(req.Password, user.Password) {
		utils.WriteError(w, http.StatusUnauthorized, "invalid_credentials", "Invalid email or password")
		return
	}

	token, err := h.authService.GenerateToken(user.ID, string(user.Role))
	if err != nil {
		h.logger.Error("Failed to generate token", zap.Error(err))
		utils.WriteError(w, http.StatusInternalServerError, "token_error", "Failed to generate token")
		return
	}

	response := models.LoginResponse{
		Token: token,
		User:  *user,
	}

	utils.WriteSuccess(w, response)
}