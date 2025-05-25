package utils

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

func ValidateStruct(s interface{}) error {
	return validate.Struct(s)
}

func FormatValidationError(err error) string {
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		var messages []string
		for _, e := range validationErrors {
			messages = append(messages, fmt.Sprintf("%s is %s", strings.ToLower(e.Field()), e.Tag()))
		}
		return strings.Join(messages, ", ")
	}
	return err.Error()
}