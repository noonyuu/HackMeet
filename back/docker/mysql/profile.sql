CREATE TABLE profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  avatar_url VARCHAR(255),
  nick_name VARCHAR(255),
  bio TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);