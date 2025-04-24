CREATE TABLE IF NOT EXISTS works (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(255),
  profile_id VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id)
);