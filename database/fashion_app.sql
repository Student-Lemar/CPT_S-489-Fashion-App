-- CPTS 489 Fashion App (optional server DB) schema dump
-- This schema supports the optional Express + Sequelize server under `server/`.
-- The React client submission runs in localStorage mode and does not require this DB.

CREATE DATABASE IF NOT EXISTS `fashion_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fashion_app`;

-- Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `username` VARCHAR(64) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('creator','admin') NOT NULL DEFAULT 'creator',
  `status` ENUM('active','suspended') NOT NULL DEFAULT 'active',
  `display_name` VARCHAR(120) NOT NULL,
  `reports` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_uk` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Profiles (keyed by username)
CREATE TABLE IF NOT EXISTS `profiles` (
  `username` VARCHAR(64) NOT NULL,
  `display_name` VARCHAR(120) NOT NULL,
  `bio` TEXT NULL,
  `email` VARCHAR(190) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`username`),
  CONSTRAINT `profiles_username_fk` FOREIGN KEY (`username`) REFERENCES `users` (`username`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items
CREATE TABLE IF NOT EXISTS `items` (
  `id` VARCHAR(80) NOT NULL,
  `owner_username` VARCHAR(64) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `category` ENUM('tops','bottoms','shoes','outerwear','accessories') NOT NULL,
  `color` VARCHAR(64) NOT NULL,
  `color_extracted` VARCHAR(64) NULL,
  `icon` VARCHAR(8) NULL,
  `tags` JSON NOT NULL,
  `notes` TEXT NULL,
  `image_data_url` LONGTEXT NULL,
  `added_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `items_owner_username_idx` (`owner_username`),
  CONSTRAINT `items_owner_username_fk` FOREIGN KEY (`owner_username`) REFERENCES `users` (`username`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Outfits
CREATE TABLE IF NOT EXISTS `outfits` (
  `id` VARCHAR(80) NOT NULL,
  `owner_username` VARCHAR(64) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `occasion` VARCHAR(80) NOT NULL DEFAULT 'Everyday',
  `caption` TEXT NULL,
  `items` JSON NOT NULL,
  `item_icons` JSON NOT NULL,
  `posted` TINYINT(1) NOT NULL DEFAULT 0,
  `board_ids` JSON NOT NULL,
  `likes` INT NOT NULL DEFAULT 0,
  `ai_meta` JSON NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `outfits_owner_username_idx` (`owner_username`),
  CONSTRAINT `outfits_owner_username_fk` FOREIGN KEY (`owner_username`) REFERENCES `users` (`username`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Boards
CREATE TABLE IF NOT EXISTS `boards` (
  `id` VARCHAR(80) NOT NULL,
  `owner_username` VARCHAR(64) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `description` TEXT NULL,
  `visibility` ENUM('private','public') NOT NULL DEFAULT 'private',
  `outfit_ids` JSON NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `boards_owner_username_idx` (`owner_username`),
  CONSTRAINT `boards_owner_username_fk` FOREIGN KEY (`owner_username`) REFERENCES `users` (`username`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Follows (many-to-many via composite PK)
CREATE TABLE IF NOT EXISTS `follows` (
  `follower_username` VARCHAR(64) NOT NULL,
  `followed_username` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`follower_username`, `followed_username`),
  CONSTRAINT `follows_follower_fk` FOREIGN KEY (`follower_username`) REFERENCES `users` (`username`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `follows_followed_fk` FOREIGN KEY (`followed_username`) REFERENCES `users` (`username`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports (moderation queue)
CREATE TABLE IF NOT EXISTS `reports` (
  `id` VARCHAR(64) NOT NULL,
  `type` ENUM('post','board') NOT NULL,
  `status` ENUM('pending','removed','hidden','resolved') NOT NULL DEFAULT 'pending',
  `content_id` VARCHAR(120) NOT NULL,
  `content_label` VARCHAR(160) NOT NULL,
  `poster_username` VARCHAR(64) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `caption` TEXT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reports_poster_username_idx` (`poster_username`),
  CONSTRAINT `reports_poster_username_fk` FOREIGN KEY (`poster_username`) REFERENCES `users` (`username`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log
CREATE TABLE IF NOT EXISTS `audit_log_entries` (
  `id` VARCHAR(80) NOT NULL,
  `admin_username` VARCHAR(64) NOT NULL,
  `action` VARCHAR(160) NOT NULL,
  `target` VARCHAR(255) NOT NULL,
  `timestamp` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_admin_username_idx` (`admin_username`),
  CONSTRAINT `audit_admin_username_fk` FOREIGN KEY (`admin_username`) REFERENCES `users` (`username`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

