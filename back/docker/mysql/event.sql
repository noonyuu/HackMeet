CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  start_date DATETIME,
  end_date DATETIME,
  location VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
)