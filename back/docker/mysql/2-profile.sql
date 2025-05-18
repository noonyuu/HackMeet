CREATE TABLE IF NOT EXISTS providers (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  provider_id VARCHAR(255),
  provider VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  UNIQUE KEY (user_id, provider_id),
  CONSTRAINT fk_providers_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
) ENGINE=InnoDB;
