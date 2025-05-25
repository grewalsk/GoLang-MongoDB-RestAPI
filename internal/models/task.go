package models

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type TaskStatus string

const (
	StatusOpen       TaskStatus = "open"
	StatusInProgress TaskStatus = "in_progress"
	StatusDone       TaskStatus = "done"
)

type Task struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title       string             `json:"title" bson:"title" validate:"required,min=1,max=200"`
	Description string             `json:"description" bson:"description" validate:"max=1000"`
	Status      TaskStatus         `json:"status" bson:"status" validate:"required,oneof=open in_progress done"`
	OwnerID     primitive.ObjectID `json:"owner_id" bson:"owner_id"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
	DeletedAt   *time.Time         `json:"deleted_at,omitempty" bson:"deleted_at,omitempty"`
}

type TaskFilter struct {
	OwnerID *primitive.ObjectID `json:"owner_id,omitempty"`
	Status  *TaskStatus         `json:"status,omitempty"`
	Search  string              `json:"search,omitempty"`
	Limit   int64               `json:"limit"`
	Offset  int64               `json:"offset"`
}

type TaskDAO struct {
	collection *mongo.Collection
}

func NewTaskDAO(db *mongo.Database) *TaskDAO {
	return &TaskDAO{
		collection: db.Collection("tasks"),
	}
}

func (dao *TaskDAO) Create(ctx context.Context, task *Task) error {
	task.ID = primitive.NewObjectID()
	task.CreatedAt = time.Now()
	task.UpdatedAt = time.Now()

	_, err := dao.collection.InsertOne(ctx, task)
	return err
}

func (dao *TaskDAO) GetByID(ctx context.Context, id primitive.ObjectID) (*Task, error) {
	var task Task
	filter := bson.M{
		"_id":        id,
		"deleted_at": bson.M{"$exists": false},
	}

	err := dao.collection.FindOne(ctx, filter).Decode(&task)
	if err != nil {
		return nil, err
	}

	return &task, nil
}

func (dao *TaskDAO) Update(ctx context.Context, id primitive.ObjectID, updates bson.M) error {
	updates["updated_at"] = time.Now()

	filter := bson.M{
		"_id":        id,
		"deleted_at": bson.M{"$exists": false},
	}

	update := bson.M{"$set": updates}
	_, err := dao.collection.UpdateOne(ctx, filter, update)
	return err
}

func (dao *TaskDAO) Delete(ctx context.Context, id primitive.ObjectID) error {
	filter := bson.M{
		"_id":        id,
		"deleted_at": bson.M{"$exists": false},
	}

	update := bson.M{
		"$set": bson.M{
			"deleted_at": time.Now(),
			"updated_at": time.Now(),
		},
	}

	_, err := dao.collection.UpdateOne(ctx, filter, update)
	return err
}

func (dao *TaskDAO) List(ctx context.Context, filter TaskFilter) ([]*Task, error) {
	query := bson.M{"deleted_at": bson.M{"$exists": false}}

	if filter.OwnerID != nil {
		query["owner_id"] = *filter.OwnerID
	}

	if filter.Status != nil {
		query["status"] = *filter.Status
	}

	if filter.Search != "" {
		query["$text"] = bson.M{"$search": filter.Search}
	}

	opts := options.Find()
	if filter.Limit > 0 {
		opts.SetLimit(filter.Limit)
	}
	if filter.Offset > 0 {
		opts.SetSkip(filter.Offset)
	}
	opts.SetSort(bson.M{"created_at": -1})

	cursor, err := dao.collection.Find(ctx, query, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []*Task
	if err := cursor.All(ctx, &tasks); err != nil {
		return nil, err
	}

	return tasks, nil
}