package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/grewalsk/task-api/internal/db"
	"github.com/grewalsk/task-api/internal/utils"
)

type HealthHandler struct {
	db *db.DB
}

func NewHealthHandler(db *db.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	if err := h.db.Client.Ping(ctx, nil); err != nil {
		utils.WriteError(w, http.StatusServiceUnavailable, "database_error", "Database connection failed")
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}