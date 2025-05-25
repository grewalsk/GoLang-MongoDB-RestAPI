package db

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DB struct {
	Client   *mongo.Client
	Database *mongo.Database
}

func NewConnection(uri, database string) (*DB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	db := client.Database(database)

	return &DB{
		Client:   client,
		Database: db,
	}, nil
}

func (db *DB) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return db.Client.Disconnect(ctx)
}

func (db *DB) CreateIndexes() error {
	ctx := context.Background()
	collection := db.Database.Collection("tasks")

	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "owner_id", Value: 1},
				{Key: "status", Value: 1},
			},
		},
		{
			Keys: bson.D{
				{Key: "title", Value: "text"},
				{Key: "description", Value: "text"},
			},
		},
	}

	_, err := collection.Indexes().CreateMany(ctx, indexes)
	return err
}