CREATE TABLE IF NOT EXISTS work_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id INT,
  skill_id INT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (work_id) REFERENCES works(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id)
)