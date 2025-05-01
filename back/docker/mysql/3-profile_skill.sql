CREATE TABLE IF NOT EXISTS profile_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255),
  skill_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (profile_id) REFERENCES profiles(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id)
  UNIQUE KEY (profile_id, skill_id)
);
