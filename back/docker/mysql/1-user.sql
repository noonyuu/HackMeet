CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
);
