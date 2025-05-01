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
  updated_by VARCHAR(255)
);CREATE TABLE IF NOT EXISTS skills (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  category VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
);CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
);
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  avatar_url VARCHAR(255),
  nick_name VARCHAR(255),
  graduation_year INT,
  affiliation VARCHAR(255),
  bio TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);CREATE TABLE IF NOT EXISTS profile_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255),
  skill_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (profile_id) REFERENCES profiles(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id)
);
CREATE TABLE IF NOT EXISTS works (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(255),
  profile_id VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id)
);CREATE TABLE IF NOT EXISTS work_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id INT,
  skill_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (work_id) REFERENCES works(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id)
);