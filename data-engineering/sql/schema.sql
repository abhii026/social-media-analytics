-- DevOrbit: Social Media Analysis Platform
-- Database Schema for Multi-Platform Social Media Ingestion & NLP Analytics
-- Compatible with MySQL 8.0+

CREATE DATABASE IF NOT EXISTS devorbit_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE devorbit_db;

-- 1. Configured Ingestion Sources (Public Channels, Test Bot, Platform Adapters)
CREATE TABLE IF NOT EXISTS `sources` (
  `source_id` VARCHAR(50) NOT NULL,
  `source_name` VARCHAR(100) NOT NULL,
  `platform` VARCHAR(30) NOT NULL,
  `channel_username` VARCHAR(100) DEFAULT NULL,
  `access_status` VARCHAR(50) NOT NULL, -- CONNECTED, AUTHORIZATION_REQUIRED, TEST_ONLY, NOT_CONNECTED
  `data_type` VARCHAR(20) NOT NULL,    -- REAL_DATA, TEST_DATA
  `last_collected_message` TEXT DEFAULT NULL,
  `messages_collected` INT DEFAULT 0,
  `last_sync_time` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Raw Ingested Posts (Telegram Public Channels, Test Pipeline, API Adapters)
CREATE TABLE IF NOT EXISTS `posts` (
  `post_id` VARCHAR(100) NOT NULL,
  `platform` VARCHAR(30) NOT NULL,
  `user_id` VARCHAR(100) DEFAULT NULL,
  `text` TEXT,
  `timestamp` DATETIME NOT NULL,
  `likes` INT DEFAULT 0,
  `comments` INT DEFAULT 0,
  `shares` INT DEFAULT 0,
  `data_type` VARCHAR(20) NOT NULL DEFAULT 'REAL_DATA', -- REAL_DATA, TEST_DATA
  `source_name` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Sentiment & Emotion Analysis Results
CREATE TABLE IF NOT EXISTS `sentiment_results` (
  `result_id` INT NOT NULL AUTO_INCREMENT,
  `post_id` VARCHAR(100) NOT NULL,
  `sentiment` VARCHAR(30) DEFAULT NULL,
  `emotion` VARCHAR(50) DEFAULT NULL,
  `confidence` DECIMAL(5,4) DEFAULT NULL,
  `analyzed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`result_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `sentiment_results_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Trend & Topic Growth Results
CREATE TABLE IF NOT EXISTS `trend_results` (
  `trend_id` INT NOT NULL AUTO_INCREMENT,
  `topic` VARCHAR(255) NOT NULL,
  `keyword` VARCHAR(255) DEFAULT NULL,
  `mention_count` INT DEFAULT 0,
  `growth_rate` DECIMAL(8,2) DEFAULT NULL,
  `detected_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`trend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Anonymized Aggregate Demographics Insights
CREATE TABLE IF NOT EXISTS `demographics` (
  `demographic_id` INT NOT NULL AUTO_INCREMENT,
  `platform` VARCHAR(30) DEFAULT NULL,
  `age_group` VARCHAR(30) DEFAULT NULL,
  `location` VARCHAR(100) DEFAULT NULL,
  `language` VARCHAR(50) DEFAULT NULL,
  `professional_interest` VARCHAR(100) DEFAULT NULL,
  `user_count` INT DEFAULT 0,
  `analyzed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`demographic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
