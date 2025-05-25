package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/grewalsk/task-api/internal/handlers"
	"github.com/grewalsk/task-api/internal/middleware"
	"github.com/rs/cors"
	"go.uber.org/zap"
)

func Setup(
	taskHandler *handlers.TaskHandler,
	authHandler *handlers.AuthHandler,
	healthHandler *handlers.HealthHandler,
	jwtSecret string,
	logger *zap.Logger,
) *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.Recovery(logger))
	r.Use(middleware.Logging(logger))

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})
	r.Use(c.Handler)

	r.Route("/v1", func(r chi.Router) {
		r.Post("/login", authHandler.Login)

		r.Route("/tasks", func(r chi.Router) {
			r.Use(middleware.JWTAuth(jwtSecret))
			r.Post("/", taskHandler.Create)
			r.Get("/", taskHandler.List)
			r.Get("/{id}", taskHandler.GetByID)
			r.Patch("/{id}", taskHandler.Update)
			r.Delete("/{id}", taskHandler.Delete)
		})
	})

	r.Get("/healthz", healthHandler.Check)

	return r
}