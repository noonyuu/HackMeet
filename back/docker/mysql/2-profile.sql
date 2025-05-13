CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(255) PRIMARY KEY,
  avatar_url VARCHAR(255),
  nick_name VARCHAR(255),
  graduation_year INT,
  affiliation VARCHAR(255),
  bio TEXT,
  created_at DATETIME,
  updated_at DATETIME
) ENGINE=InnoDB;
