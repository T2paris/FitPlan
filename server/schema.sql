CREATE DATABASE IF NOT EXISTS `fittracker_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fittracker_db`;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `age` INT DEFAULT NULL,
    `weight` DECIMAL(5,2) DEFAULT NULL,
    `height` DECIMAL(5,2) DEFAULT NULL,
    `sport` VARCHAR(50) DEFAULT NULL,
    `custom_sport` VARCHAR(100) DEFAULT NULL,
    `experience` VARCHAR(50) DEFAULT NULL,
    `goals` TEXT DEFAULT NULL,
    `injuries` TEXT DEFAULT NULL,
    `injury_details` TEXT DEFAULT NULL,
    `days_per_week` INT DEFAULT NULL,
    `hours_per_session` DECIMAL(3,1) DEFAULT NULL,
    `budget` VARCHAR(50) DEFAULT NULL,
    `equipment` VARCHAR(100) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `target_vert` INT DEFAULT NULL,
    `target_weight` INT DEFAULT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `plans` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `plan_json` LONGTEXT DEFAULT NULL,
    `week` INT DEFAULT 1,
    `open_sections_json` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `checks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `check_key` VARCHAR(150) NOT NULL,
    `checked` BOOLEAN DEFAULT TRUE,
    UNIQUE KEY `user_check_unique` (`user_id`, `check_key`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `stats` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `type` VARCHAR(20) NOT NULL, -- 'verts' ou 'weights'
    `date_label` VARCHAR(20) NOT NULL,
    `value` DECIMAL(5,2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
