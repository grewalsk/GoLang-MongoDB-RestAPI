package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JWTConfig      `mapstructure:"jwt"`
}

type ServerConfig struct {
	Port string `mapstructure:"port"`
	Host string `mapstructure:"host"`
}

type DatabaseConfig struct {
	URI      string `mapstructure:"uri"`
	Database string `mapstructure:"database"`
}

type JWTConfig struct {
	Secret     string `mapstructure:"secret"`
	ExpiryHours int   `mapstructure:"expiry_hours"`
}

func Load() (*Config, error) {
	viper.SetDefault("server.port", "8080")
	viper.SetDefault("server.host", "0.0.0.0")
	viper.SetDefault("database.uri", "mongodb://localhost:27017")
	viper.SetDefault("database.database", "taskdb")
	viper.SetDefault("jwt.secret", "your_secret_key")
	viper.SetDefault("jwt.expiry_hours", 24)

	viper.AutomaticEnv()
	viper.SetEnvPrefix("TASKAPI")

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}