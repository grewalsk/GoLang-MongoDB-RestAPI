package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/grewalsk/task-api/internal/middleware"
	"github.com/grewalsk/task-api/internal/models"
	"github.com/grewalsk/task-api/internal/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.uber.org/zap"
)

type TaskHandler struct {
	taskDAO *models.TaskDAO
	logger  *zap.Logger
}

func NewTaskHandler(taskDAO *models.TaskDAO, logger *zap.Logger) *TaskHandler {
	return &TaskHandler{
		taskDAO: taskDAO,
		logger:  logger,
	}
}

func (h *TaskHandler) Create(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "unauthorized", "User not found in context")
		return
	}

	var task models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid_request", "Invalid JSON")
		return
	}

	task.OwnerID = user.UserID
	if task.Status == "" {
		task.Status = models.StatusOpen
	}

	if err := utils.ValidateStruct(task); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "validation_error", utils.FormatValidationError(err))
		return
	}

	if err := h.taskDAO.Create(r.Context(), &task); err != nil {
		h.logger.Error("Failed to create task", zap.Error(err))
		utils.WriteError(w, http.StatusInternalServerError, "database_error", "Failed to create task")
		return
	}

	utils.WriteJSON(w, http.StatusCreated, task)
}

func (h *TaskHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid_id", "Invalid task ID")
		return
	}

	task, err := h.taskDAO.GetByID(r.Context(), id)
	if err != nil {
		utils.WriteError(w, http.StatusNotFound, "not_found", "Task not found")
		return
	}

	utils.WriteSuccess(w, task)
}

func (h *TaskHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid_id", "Invalid task ID")
		return
	}

	user, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "unauthorized", "User not found in context")
		return
	}

	task, err := h.taskDAO.GetByID(r.Context(), id)
	if err != nil {
		utils.WriteError(w, http.StatusNotFound, "not_found", "Task not found")
		return
	}

	if task.OwnerID != user.UserID && user.Role != string(models.RoleAdmin) {
		utils.WriteError(w, http.StatusForbidden, "forbidden", "Cannot update task owned by another user")
		return
	}

	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid_request", "Invalid JSON")
		return
	}

	allowedFields := map[string]bool{
		"title":       true,
		"description": true,
		"status":      true,
	}

	updateDoc := bson.M{}
	for key, value := range updates {
		if allowedFields[key] {
			updateDoc[key] = value
		}
	}

	if len(updateDoc) == 0 {
		utils.WriteError(w, http.StatusBadRequest, "no_updates", "No valid fields to update")
		return
	}

	if err := h.taskDAO.Update(r.Context(), id, updateDoc); err != nil {
		h.logger.Error("Failed to update task", zap.Error(err))
		utils.WriteError(w, http.StatusInternalServerError, "database_error", "Failed to update task")
		return
	}

	updatedTask, _ := h.taskDAO.GetByID(r.Context(), id)
	utils.WriteSuccess(w, updatedTask)
}

func (h *TaskHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid_id", "Invalid task ID")
		return
	}

	user, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "unauthorized", "User not found in context")
		return
	}

	task, err := h.taskDAO.GetByID(r.Context(), id)
	if err != nil {
		utils.WriteError(w, http.StatusNotFound, "not_found", "Task not found")
		return
	}

	if task.OwnerID != user.UserID && user.Role != string(models.RoleAdmin) {
		utils.WriteError(w, http.StatusForbidden, "forbidden", "Cannot delete task owned by another user")
		return
	}

	if err := h.taskDAO.Delete(r.Context(), id); err != nil {
		h.logger.Error("Failed to delete task", zap.Error(err))
		utils.WriteError(w, http.StatusInternalServerError, "database_error", "Failed to delete task")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *TaskHandler) List(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "unauthorized", "User not found in context")
		return
	}

	filter := models.TaskFilter{
		Limit:  10,
		Offset: 0,
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.ParseInt(limitStr, 10, 64); err == nil && limit > 0 {
			filter.Limit = limit
		}
	}

	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if offset, err := strconv.ParseInt(offsetStr, 10, 64); err == nil && offset >= 0 {
			filter.Offset = offset
		}
	}

	if statusStr := r.URL.Query().Get("status"); statusStr != "" {
		status := models.TaskStatus(statusStr)
		filter.Status = &status
	}

	if ownerStr := r.URL.Query().Get("owner"); ownerStr != "" {
		if ownerID, err := primitive.ObjectIDFromHex(ownerStr); err == nil {
			filter.OwnerID = &ownerID
		}
	}

	if search := r.URL.Query().Get("search"); search != "" {
		filter.Search = search
	}

	if user.Role != string(models.RoleAdmin) {
		filter.OwnerID = &user.UserID
	}

	tasks, err := h.taskDAO.List(r.Context(), filter)
	if err != nil {
		h.logger.Error("Failed to list tasks", zap.Error(err))
		utils.WriteError(w, http.StatusInternalServerError, "database_error", "Failed to list tasks")
		return
	}

	utils.WriteSuccess(w, tasks)
}