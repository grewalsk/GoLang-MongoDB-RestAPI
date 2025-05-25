package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/grewalsk/task-api/internal/config"
	"github.com/grewalsk/task-api/internal/db"
	"github.com/grewalsk/task-api/internal/handlers"
	"github.com/grewalsk/task-api/internal/models"
	"github.com/grewalsk/task-api/internal/routes"
	"github.com/grewalsk/task-api/internal/services"
	"go.uber.org/zap"
)

func main() {
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	cfg, err := config.Load()
	if err != nil {
		logger.Fatal("Failed to load config", zap.Error(err))
	}

	database, err := db.NewConnection(cfg.Database.URI, cfg.Database.Database)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer database.Close()

	if err := database.CreateIndexes(); err != nil {
		logger.Error("Failed to create indexes", zap.Error(err))
	}

	taskDAO := models.NewTaskDAO(database.Database)
	authService := services.NewAuthService(cfg.JWT.Secret, cfg.JWT.ExpiryHours)

	taskHandler := handlers.NewTaskHandler(taskDAO, logger)
	authHandler := handlers.NewAuthHandler(authService, logger)
	healthHandler := handlers.NewHealthHandler(database)

	router := routes.Setup(taskHandler, authHandler, healthHandler, cfg.JWT.Secret, logger)

	server := &http.Server{
		Addr:    fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler: router,
	}

	go func() {
		logger.Info("Starting server", zap.String("addr", server.Addr))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Server failed to start", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")
}