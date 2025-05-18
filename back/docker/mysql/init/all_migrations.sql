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
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS skills (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  category VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
) ENGINE=InnoDB;
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
CREATE TABLE IF NOT EXISTS providers (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE,
  provider_id VARCHAR(255) UNIQUE,
  provider VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS profile_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255),
  skill_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (profile_id) REFERENCES profiles(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id),
  UNIQUE KEY uniq_profile_skill (profile_id, skill_id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS works (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS work_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id VARCHAR(255),
  profile_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (work_id) REFERENCES works(id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS work_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id VARCHAR(255),
  profile_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (work_id) REFERENCES works(id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS work_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id VARCHAR(255),
  skill_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (work_id) REFERENCES works(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id)
) ENGINE=InnoDB;
