CREATE TABLE IF NOT EXISTS providers (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  provider_id VARCHAR(255) UNIQUE,
  provider VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
) ENGINE=InnoDB;
