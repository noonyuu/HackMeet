CREATE TABLE IF NOT EXISTS work_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id VARCHAR(255),
  image_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (work_id) REFERENCES works(id),
  FOREIGN KEY (image_id) REFERENCES diagram_images(id)
) ENGINE=InnoDB;
