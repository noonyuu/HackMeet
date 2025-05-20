CREATE TABLE IF NOT EXISTS work_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id VARCHAR(255),
  event_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (work_id) REFERENCES works(id),
  FOREIGN KEY (event_id) REFERENCES profiles(id)
) ENGINE=InnoDB;
