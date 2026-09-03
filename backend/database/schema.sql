-- ArchiVis relational schema (MySQL 8+)
-- Executed by `npm run db:migrate` (drops and recreates every table).

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS newsletter_subscribers;
DROP TABLE IF EXISTS design_materials;
DROP TABLE IF EXISTS design_tags;
DROP TABLE IF EXISTS design_images;
DROP TABLE IF EXISTS designs;
DROP TABLE IF EXISTS architect_awards;
DROP TABLE IF EXISTS architect_specialties;
DROP TABLE IF EXISTS architects;
DROP TABLE IF EXISTS styles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(190)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- `is_filter` marks the styles shown as filter chips in the UI; specialty-only styles
-- (e.g. "Adaptive Reuse") are stored but stay out of the filter bar.
CREATE TABLE styles (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60) NOT NULL,
  slug       VARCHAR(60) NOT NULL,
  is_filter  TINYINT(1)  NOT NULL DEFAULT 0,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_styles_name (name),
  UNIQUE KEY uq_styles_slug (slug),
  KEY idx_styles_filter (is_filter, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE architects (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(120)  NOT NULL,
  title            VARCHAR(120)  NOT NULL,
  firm             VARCHAR(160)  NOT NULL,
  location         VARCHAR(120)  NOT NULL,
  experience_years SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  rating           DECIMAL(2,1)  NOT NULL DEFAULT 0.0,
  reviews_count    INT UNSIGNED  NOT NULL DEFAULT 0,
  projects_count   INT UNSIGNED  NOT NULL DEFAULT 0,
  image_url        VARCHAR(500)  NOT NULL,
  bio              TEXT          NOT NULL,
  starting_budget  VARCHAR(40)   NOT NULL,
  phone            VARCHAR(40)   NOT NULL,
  email            VARCHAR(190)  NOT NULL,
  website          VARCHAR(190)  NOT NULL,
  instagram        VARCHAR(120)  NOT NULL,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_architects_location (location),
  KEY idx_architects_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE architect_specialties (
  architect_id INT UNSIGNED NOT NULL,
  style_id     INT UNSIGNED NOT NULL,
  PRIMARY KEY (architect_id, style_id),
  KEY idx_specialties_style (style_id),
  CONSTRAINT fk_specialties_architect FOREIGN KEY (architect_id) REFERENCES architects (id) ON DELETE CASCADE,
  CONSTRAINT fk_specialties_style     FOREIGN KEY (style_id)     REFERENCES styles (id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE architect_awards (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  architect_id INT UNSIGNED NOT NULL,
  title        VARCHAR(200) NOT NULL,
  sort_order   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  KEY idx_awards_architect (architect_id),
  CONSTRAINT fk_awards_architect FOREIGN KEY (architect_id) REFERENCES architects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE designs (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(160)  NOT NULL,
  slug           VARCHAR(180)  NOT NULL,
  style_id       INT UNSIGNED  NOT NULL,
  architect_id   INT UNSIGNED  NOT NULL,
  budget_label   VARCHAR(40)   NOT NULL,
  budget_amount  BIGINT UNSIGNED NOT NULL,
  location       VARCHAR(160)  NOT NULL,
  rating         DECIMAL(2,1)  NOT NULL DEFAULT 0.0,
  reviews_count  INT UNSIGNED  NOT NULL DEFAULT 0,
  featured       TINYINT(1)    NOT NULL DEFAULT 0,
  image_url      VARCHAR(500)  NOT NULL,
  description    TEXT          NOT NULL,
  bedrooms       SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  bathrooms      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  area_label     VARCHAR(40)   NOT NULL,
  timeline_label VARCHAR(40)   NOT NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_designs_slug (slug),
  KEY idx_designs_style (style_id),
  KEY idx_designs_architect (architect_id),
  KEY idx_designs_budget (budget_amount),
  KEY idx_designs_featured (featured),
  KEY idx_designs_rating (rating),
  KEY idx_designs_title (title),
  KEY idx_designs_location (location),
  CONSTRAINT fk_designs_style     FOREIGN KEY (style_id)     REFERENCES styles (id),
  CONSTRAINT fk_designs_architect FOREIGN KEY (architect_id) REFERENCES architects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE design_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  design_id  INT UNSIGNED NOT NULL,
  url        VARCHAR(500) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  KEY idx_images_design (design_id),
  CONSTRAINT fk_images_design FOREIGN KEY (design_id) REFERENCES designs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE design_tags (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  design_id INT UNSIGNED NOT NULL,
  tag       VARCHAR(60)  NOT NULL,
  KEY idx_tags_design (design_id),
  KEY idx_tags_tag (tag),
  CONSTRAINT fk_tags_design FOREIGN KEY (design_id) REFERENCES designs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE design_materials (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  design_id  INT UNSIGNED NOT NULL,
  material   VARCHAR(80)  NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  KEY idx_materials_design (design_id),
  CONSTRAINT fk_materials_design FOREIGN KEY (design_id) REFERENCES designs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favorites (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  design_id  INT UNSIGNED NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_favorites_user_design (user_id, design_id),
  KEY idx_favorites_design (design_id),
  CONSTRAINT fk_favorites_user   FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE CASCADE,
  CONSTRAINT fk_favorites_design FOREIGN KEY (design_id) REFERENCES designs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inquiries (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  email        VARCHAR(190) NOT NULL,
  subject      VARCHAR(200) NOT NULL,
  message      TEXT         NOT NULL,
  architect_id INT UNSIGNED NULL,
  user_id      INT UNSIGNED NULL,
  status       ENUM('new','read','replied') NOT NULL DEFAULT 'new',
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_inquiries_status (status),
  KEY idx_inquiries_architect (architect_id),
  KEY idx_inquiries_user (user_id),
  CONSTRAINT fk_inquiries_architect FOREIGN KEY (architect_id) REFERENCES architects (id) ON DELETE SET NULL,
  CONSTRAINT fk_inquiries_user      FOREIGN KEY (user_id)      REFERENCES users (id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE testimonials (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  location   VARCHAR(160) NOT NULL,
  rating     TINYINT UNSIGNED NOT NULL DEFAULT 5,
  design_id  INT UNSIGNED NULL,
  body       TEXT         NOT NULL,
  image_url  VARCHAR(500) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  KEY idx_testimonials_design (design_id),
  CONSTRAINT fk_testimonials_design FOREIGN KEY (design_id) REFERENCES designs (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE newsletter_subscribers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(190) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_newsletter_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
