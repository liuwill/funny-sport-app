/*
 Navicat Premium Data Transfer

 Source Server         : Localhost
 Source Server Type    : MySQL
 Source Server Version : 50717
 Source Host           : localhost
 Source Database       : cAuth

 Target Server Type    : MySQL
 Target Server Version : 50717
 File Encoding         : utf-8

 Date: 08/10/2017 22:22:52 PM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `cSessionInfo`
-- ----------------------------
DROP TABLE IF EXISTS `cSessionInfo`;
CREATE TABLE `cSessionInfo` (
  `open_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uuid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `skey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_visit_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `session_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_info` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`open_id`),
  KEY `openid` (`open_id`) USING BTREE,
  KEY `skey` (`skey`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话管理用户信息';

DROP TABLE IF EXISTS `cUserInfo`;
CREATE TABLE `cUserInfo` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `open_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(11,2) UNSIGNED DEFAULT 0,
  `nickname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `openid` (`open_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

DROP TABLE IF EXISTS `cUserStep`;
CREATE TABLE `cUserStep` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL,
  `score` decimal(11,2) UNSIGNED DEFAULT 0,
  `step` int(11) UNSIGNED DEFAULT 0,
  `device` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户计步信息表';

DROP TABLE IF EXISTS `cUserScoreRecord`;
CREATE TABLE `cUserScoreRecord` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL,
  `score` decimal(11,2) UNSIGNED DEFAULT 0,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(32) DEFAULT 'step',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分信息表';

DROP TABLE IF EXISTS `cAwardGoods`;
CREATE TABLE `cAwardGoods` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `serial_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(11,2) UNSIGNED DEFAULT 0,
  `price` decimal(11,2) UNSIGNED DEFAULT 0,
  `stock` int(11) UNSIGNED DEFAULT 0,
  `sales` int(11) UNSIGNED DEFAULT 0,
  `title` varchar(32) NOT NULL,
  `content` varchar(32) NOT NULL,
  `status` int(11) UNSIGNED DEFAULT 0,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_id` (`serial_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分信息表';

DROP TABLE IF EXISTS `cAwardOrder`;
CREATE TABLE `cAwardOrder` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serial_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `score` decimal(11,2) UNSIGNED DEFAULT 0,
  `status` int(11) UNSIGNED DEFAULT 0,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `finish_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分信息表';

DROP TABLE IF EXISTS `cUserScoreUsage`;
CREATE TABLE `cUserScoreUsage` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL,
  `order_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(11,2)  UNSIGNED DEFAULT 0,
  `open_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(32) DEFAULT 'step',
  `status` int(11) UNSIGNED DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分信息表';

SET FOREIGN_KEY_CHECKS = 1;
