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
