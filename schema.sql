-- schema.sql
-- продолжаем

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(128) NOT NULL UNIQUE,
  name_ru VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  theme ENUM('light','dark') DEFAULT 'light',
  planned_completion CHAR(7) DEFAULT NULL, -- YYYY-MM
  progress_pct TINYINT DEFAULT 0,
  presentation_url TEXT,
  masterplan_url TEXT,
  masterplan_caption_ru VARCHAR(255) DEFAULT NULL,
  masterplan_caption_en VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS project_includes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  lang ENUM('ru','en') NOT NULL,
  item TEXT NOT NULL,
  sort INT DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS villas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  villa_id VARCHAR(128) NOT NULL UNIQUE,
  name_ru VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  status ENUM('available','reserved','hold') DEFAULT 'available',
  rooms VARCHAR(20),
  land DECIMAL(10,2) DEFAULT 0,
  area DECIMAL(10,2) DEFAULT 0,
  f1 DECIMAL(10,2) DEFAULT 0,
  f2 DECIMAL(10,2) DEFAULT 0,
  roof DECIMAL(10,2) DEFAULT 0,
  garden DECIMAL(10,2) DEFAULT 0,
  ppsm DECIMAL(12,2) DEFAULT 0,
  base_usd DECIMAL(12,2) DEFAULT 0,
  monthly_price_growth_pct DECIMAL(5,2) DEFAULT 0,
  leasehold_end DATE DEFAULT NULL,
  daily_rate_usd DECIMAL(10,2) DEFAULT 0,
  occupancy_pct DECIMAL(5,2) DEFAULT 0,
  rental_price_index_pct DECIMAL(5,2) DEFAULT 0,
  sort INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  date CHAR(7) DEFAULT NULL, -- YYYY-MM
  title_ru VARCHAR(255) DEFAULT NULL,
  title_en VARCHAR(255) DEFAULT NULL,
  type ENUM('youtube','album') DEFAULT 'youtube',
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  k VARCHAR(64) NOT NULL UNIQUE,
  v TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO settings(k, v) VALUES
('idr_per_usd','16300'),
('eur_per_usd','0.88'),
('default_currency','USD');
