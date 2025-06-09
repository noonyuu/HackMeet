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
CREATE TABLE IF NOT EXISTS images (
  id VARCHAR(255) PRIMARY KEY,
  image_url VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS diagram_images (
  id VARCHAR(255) PRIMARY KEY,
  image_url VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
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
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(255) PRIMARY KEY,
  avatar_url VARCHAR(255),
  nick_name VARCHAR(255),
  graduation_year INT,
  affiliation VARCHAR(255),
  bio TEXT,
  created_at DATETIME,
  updated_at DATETIME
) ENGINE=InnoDB;CREATE TABLE IF NOT EXISTS providers (
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
  created_at DATETIME,
  updated_at DATETIME
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS work_diagram_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id VARCHAR(255),
  image_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (work_id) REFERENCES works(id),
  FOREIGN KEY (image_id) REFERENCES diagram_images(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS work_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id VARCHAR(255),
  event_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (work_id) REFERENCES works(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS work_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id VARCHAR(255),
  image_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (work_id) REFERENCES works(id),
  FOREIGN KEY (image_id) REFERENCES images(id)
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
