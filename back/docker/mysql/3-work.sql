CREATE TABLE IF NOT EXISTS works (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (event_id) REFERENCES events(id)
);