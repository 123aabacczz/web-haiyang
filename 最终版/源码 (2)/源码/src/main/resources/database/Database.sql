/*
 Navicat Premium Dump SQL

 Source Server         : wenter
 Source Server Type    : MySQL
 Source Server Version : 80042 (8.0.42)
 Source Host           : localhost:3306
 Source Schema         : zwt

 Target Server Type    : MySQL
 Target Server Version : 80042 (8.0.42)
 File Encoding         : 65001

 Date: 30/03/2026 14:58:06
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for activity_logs
-- ----------------------------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action_type` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `target_type` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `target_id` int NOT NULL,
  `action_time` datetime NULL DEFAULT NULL,
  `action_date` date GENERATED ALWAYS AS (cast(`action_time` as date)) STORED NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_activity_log`(`user_id` ASC, `action_type` ASC, `target_type` ASC, `target_id` ASC, `action_date` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 54 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of activity_logs
-- ----------------------------
INSERT INTO `activity_logs` VALUES (48, 0, 'REGISTER', 'USER', '新用户注册申请: xsz (WhiteMourning@Foxmail.com)', 97, '2026-03-28 10:00:10', DEFAULT);
INSERT INTO `activity_logs` VALUES (49, 0, 'APPROVE_TASK', 'TASK', '审核任务: 外卖配送服务, 结果: 通过, 备注: 无问题', 118, '2026-03-30 13:28:38', DEFAULT);
INSERT INTO `activity_logs` VALUES (50, 0, 'CREATE_TASK', 'TASK', '创建任务: 1', 119, '2026-03-30 13:34:24', DEFAULT);
INSERT INTO `activity_logs` VALUES (51, 0, 'DELETE_TASK', 'TASK', '删除任务: 1', 119, '2026-03-30 13:34:27', DEFAULT);
INSERT INTO `activity_logs` VALUES (52, 0, 'CREATE_TASK', 'TASK', '创建任务: 1', 120, '2026-03-30 13:34:40', DEFAULT);
INSERT INTO `activity_logs` VALUES (53, 0, 'DELETE_TASK', 'TASK', '删除任务: 1', 120, '2026-03-30 13:34:42', DEFAULT);

-- ----------------------------
-- Table structure for admins
-- ----------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `admin_level` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX ` uk_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `12` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of admins
-- ----------------------------
INSERT INTO `admins` VALUES (1, 53, 5);
INSERT INTO `admins` VALUES (2, 97, 5);

-- ----------------------------
-- Table structure for announcement
-- ----------------------------
DROP TABLE IF EXISTS `announcement`;
CREATE TABLE `announcement`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `content` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `publisher` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `publish_time` datetime NOT NULL,
  `status` int NULL DEFAULT NULL,
  `important` tinyint NOT NULL DEFAULT 0 COMMENT '0-??????1-?????-?????3-???',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `6`(`publisher` ASC) USING BTREE,
  CONSTRAINT `6` FOREIGN KEY (`publisher`) REFERENCES `users` (`username`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of announcement
-- ----------------------------
INSERT INTO `announcement` VALUES (23, '项目成功上线，网址：http://47.93.238.49:8080/login/login.html', '项目部署服务器，版本号从0.X到1.0', '曾文涛', '2026-03-30 13:42:01', 1, 0);

-- ----------------------------
-- Table structure for course_comments
-- ----------------------------
DROP TABLE IF EXISTS `course_comments`;
CREATE TABLE `course_comments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `likes` int NULL DEFAULT 0 COMMENT '点赞数',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `course_id`(`course_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `course_comments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of course_comments
-- ----------------------------
INSERT INTO `course_comments` VALUES (1, 1, 53, '课程内容很详细，老师讲解清晰，推荐给大家！', 5, '2025-09-10 14:20:00');
INSERT INTO `course_comments` VALUES (2, 1, 1, '最新一节课已更新，请及时学习。', 3, '2025-09-17 08:30:00');
INSERT INTO `course_comments` VALUES (3, 2, 53, '数据库设计原理这门课非常实用，学到了很多东西。', 8, '2025-08-25 16:45:00');
INSERT INTO `course_comments` VALUES (4, 4, 53, '云计算基础入门很好，期待后续内容。', 2, '2025-09-05 10:15:00');

-- ----------------------------
-- Table structure for course_sections
-- ----------------------------
DROP TABLE IF EXISTS `course_sections`;
CREATE TABLE `course_sections`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `section_number` int NOT NULL COMMENT '章节编号',
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `duration` int NULL DEFAULT 0 COMMENT '时长（分钟）',
  `content` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL COMMENT '章节内容',
  `video_url` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '视频链接',
  `is_completed` tinyint(1) NULL DEFAULT 0 COMMENT '是否完成',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `course_id`(`course_id` ASC) USING BTREE,
  CONSTRAINT `course_sections_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of course_sections
-- ----------------------------
INSERT INTO `course_sections` VALUES (1, 1, 1, 'React Hooks 基础', 45, '介绍 React Hooks 的基本概念和使用方法', NULL, 1);
INSERT INTO `course_sections` VALUES (2, 1, 2, 'useState 与 useEffect', 60, '深入理解 useState 和 useEffect 的工作原理', NULL, 1);
INSERT INTO `course_sections` VALUES (3, 1, 3, 'Context API 应用', 45, '使用 Context API 进行状态管理', NULL, 1);
INSERT INTO `course_sections` VALUES (4, 1, 4, '自定义 Hooks', 50, '创建和使用自定义 Hooks', NULL, 1);
INSERT INTO `course_sections` VALUES (5, 1, 5, 'React 性能优化', 60, 'React 应用的性能优化技巧', NULL, 1);
INSERT INTO `course_sections` VALUES (6, 1, 6, 'React.memo 与 useMemo', 40, '使用 React.memo 和 useMemo 优化渲染', NULL, 1);
INSERT INTO `course_sections` VALUES (7, 1, 7, 'useCallback 与 useRef', 45, '理解和使用 useCallback 与 useRef', NULL, 1);
INSERT INTO `course_sections` VALUES (8, 1, 8, 'React 18 新特性', 50, 'React 18 的新特性和改进', NULL, 1);
INSERT INTO `course_sections` VALUES (9, 1, 9, 'Server Components', 60, 'React Server Components 介绍', NULL, 0);
INSERT INTO `course_sections` VALUES (10, 1, 10, 'Testing Library', 45, '使用 Testing Library 测试 React 应用', NULL, 0);
INSERT INTO `course_sections` VALUES (11, 1, 11, '实战项目：Todo App', 75, '构建一个完整的 Todo 应用', NULL, 0);
INSERT INTO `course_sections` VALUES (12, 1, 12, '部署与优化', 40, 'React 应用的部署和性能优化', NULL, 0);
INSERT INTO `course_sections` VALUES (13, 2, 1, '数据库基础概念', 40, '数据库基本概念和术语', NULL, 1);
INSERT INTO `course_sections` VALUES (14, 2, 2, '关系型数据库设计', 50, '关系模型和数据库设计原则', NULL, 1);
INSERT INTO `course_sections` VALUES (15, 2, 3, '数据库范式', 60, '第一、第二、第三范式详解', NULL, 1);
INSERT INTO `course_sections` VALUES (16, 2, 4, 'ER 图设计', 45, '实体关系图的设计方法', NULL, 1);
INSERT INTO `course_sections` VALUES (17, 2, 5, 'SQL 基础', 55, 'SQL 语句的基本使用', NULL, 1);
INSERT INTO `course_sections` VALUES (18, 2, 6, '高级 SQL 查询', 60, '复杂查询、连接和子查询', NULL, 1);
INSERT INTO `course_sections` VALUES (19, 2, 7, '索引设计', 45, '数据库索引的设计和优化', NULL, 1);
INSERT INTO `course_sections` VALUES (20, 2, 8, '事务与并发控制', 50, '事务的 ACID 特性和并发控制', NULL, 1);
INSERT INTO `course_sections` VALUES (21, 2, 9, '数据库性能优化', 60, '数据库性能优化策略', NULL, 1);
INSERT INTO `course_sections` VALUES (22, 2, 10, '实战项目：设计一个博客系统数据库', 70, '从需求分析到数据库设计的完整流程', NULL, 1);

-- ----------------------------
-- Table structure for courses
-- ----------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `banner` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '课程封面',
  `icon` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '课程图标',
  `total_hours` int NULL DEFAULT 0 COMMENT '总学时',
  `total_sections` int NULL DEFAULT 0 COMMENT '总章节数',
  `status` enum('not_started','in_progress','completed','coming_soon') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'not_started' COMMENT '课程状态',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of courses
-- ----------------------------
INSERT INTO `courses` VALUES (1, 'React 高级开发', '深入学习 React Hooks、Context API 与性能优化技巧。', NULL, 'fab fa-react', 20, 12, 'in_progress', '2025-09-01 00:00:00', '2025-09-01 00:00:00');
INSERT INTO `courses` VALUES (2, '数据库设计原理', '掌握关系型数据库设计原则与范式，提升数据建模能力。', NULL, 'fas fa-database', 15, 10, 'completed', '2025-08-15 00:00:00', '2025-08-15 00:00:00');
INSERT INTO `courses` VALUES (3, '数据分析与可视化', '使用 Python & ECharts 实现数据清洗、分析及交互式图表。', NULL, 'fas fa-chart-line', 25, 15, 'not_started', '2025-09-10 00:00:00', '2025-09-10 00:00:00');
INSERT INTO `courses` VALUES (4, '云计算基础', '了解云原生概念，掌握 AWS / 阿里云核心服务与最佳实践。', NULL, 'fas fa-cloud', 12, 8, 'in_progress', '2025-08-20 00:00:00', '2025-08-20 00:00:00');
INSERT INTO `courses` VALUES (5, 'UI/UX 设计系统', '从 0 到 1 搭建企业级设计系统，包含组件、图标与 Token。', NULL, 'fas fa-palette', 18, 12, 'coming_soon', '2025-09-20 00:00:00', '2025-09-20 00:00:00');

-- ----------------------------
-- Table structure for invitations
-- ----------------------------
DROP TABLE IF EXISTS `invitations`;
CREATE TABLE `invitations`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `invitee_emails` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `inviter_id` int NOT NULL,
  `role` enum('member','admin','viewer') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `status` enum('pending','accepted','expired') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `inviter_id`(`inviter_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of invitations
-- ----------------------------
INSERT INTO `invitations` VALUES (2, '1', 1, 'admin', 'pending', '2025-09-11 18:36:25', '2025-09-19 18:36:26');

-- ----------------------------
-- Table structure for learning_paths
-- ----------------------------
DROP TABLE IF EXISTS `learning_paths`;
CREATE TABLE `learning_paths`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `total_hours` int NULL DEFAULT 0 COMMENT '总学时',
  `total_courses` int NULL DEFAULT 0 COMMENT '总课程数',
  `icon` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '路径图标',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of learning_paths
-- ----------------------------
INSERT INTO `learning_paths` VALUES (1, '前端全栈进阶', 'React → Node.js → 微前端 → DevOps', 60, 5, 'fas fa-laptop-code', '2025-09-01 00:00:00');
INSERT INTO `learning_paths` VALUES (2, '数据工程师路线', 'SQL → Python → Spark → BI 工具', 80, 6, 'fas fa-database', '2025-09-01 00:00:00');

-- ----------------------------
-- Table structure for login_history
-- ----------------------------
DROP TABLE IF EXISTS `login_history`;
CREATE TABLE `login_history`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `device_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `browser` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `os` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `login_time` datetime NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'success',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 545 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of login_history
-- ----------------------------
INSERT INTO `login_history` VALUES (13, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '未知IP', '未知位置', '2025-09-17 17:58:26', '成功');
INSERT INTO `login_history` VALUES (14, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 18:03:49', '成功');
INSERT INTO `login_history` VALUES (15, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 18:04:19', '成功');
INSERT INTO `login_history` VALUES (16, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 18:14:15', '成功');
INSERT INTO `login_history` VALUES (17, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 18:39:02', '成功');
INSERT INTO `login_history` VALUES (18, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 18:39:03', '成功');
INSERT INTO `login_history` VALUES (19, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 18:39:37', '成功');
INSERT INTO `login_history` VALUES (20, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 18:43:16', '成功');
INSERT INTO `login_history` VALUES (21, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 18:57:33', '成功');
INSERT INTO `login_history` VALUES (22, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 19:07:16', '成功');
INSERT INTO `login_history` VALUES (23, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 19:59:39', '成功');
INSERT INTO `login_history` VALUES (24, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 20:07:51', '成功');
INSERT INTO `login_history` VALUES (25, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 20:14:51', '成功');
INSERT INTO `login_history` VALUES (26, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 20:28:30', '成功');
INSERT INTO `login_history` VALUES (27, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 20:39:00', '成功');
INSERT INTO `login_history` VALUES (28, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 20:46:18', '成功');
INSERT INTO `login_history` VALUES (29, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 20:54:05', '成功');
INSERT INTO `login_history` VALUES (30, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 21:03:56', '成功');
INSERT INTO `login_history` VALUES (31, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 21:03:56', '成功');
INSERT INTO `login_history` VALUES (32, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 21:04:37', '成功');
INSERT INTO `login_history` VALUES (33, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 21:11:03', '成功');
INSERT INTO `login_history` VALUES (34, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 21:17:01', '成功');
INSERT INTO `login_history` VALUES (35, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 21:25:16', '成功');
INSERT INTO `login_history` VALUES (36, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 21:44:48', '成功');
INSERT INTO `login_history` VALUES (37, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 21:49:52', '成功');
INSERT INTO `login_history` VALUES (38, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 21:59:36', '成功');
INSERT INTO `login_history` VALUES (39, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 22:11:55', '成功');
INSERT INTO `login_history` VALUES (40, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 22:11:55', '成功');
INSERT INTO `login_history` VALUES (41, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 22:16:52', '成功');
INSERT INTO `login_history` VALUES (42, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 22:23:48', '成功');
INSERT INTO `login_history` VALUES (43, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 22:31:01', '成功');
INSERT INTO `login_history` VALUES (44, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 22:36:14', '成功');
INSERT INTO `login_history` VALUES (45, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 22:38:11', '成功');
INSERT INTO `login_history` VALUES (46, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-17 22:38:58', '成功');
INSERT INTO `login_history` VALUES (47, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 08:02:42', '成功');
INSERT INTO `login_history` VALUES (48, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 08:49:25', '成功');
INSERT INTO `login_history` VALUES (49, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 09:07:43', '成功');
INSERT INTO `login_history` VALUES (50, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 12:16:39', '成功');
INSERT INTO `login_history` VALUES (51, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 12:20:35', '成功');
INSERT INTO `login_history` VALUES (52, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 12:27:01', '成功');
INSERT INTO `login_history` VALUES (53, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 12:51:12', '成功');
INSERT INTO `login_history` VALUES (54, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 12:59:44', '成功');
INSERT INTO `login_history` VALUES (55, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 13:06:39', '成功');
INSERT INTO `login_history` VALUES (56, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 13:15:14', '成功');
INSERT INTO `login_history` VALUES (57, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 13:19:27', '成功');
INSERT INTO `login_history` VALUES (58, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 13:40:03', '成功');
INSERT INTO `login_history` VALUES (59, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 13:46:59', '成功');
INSERT INTO `login_history` VALUES (60, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 14:01:26', '成功');
INSERT INTO `login_history` VALUES (61, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 14:42:27', '成功');
INSERT INTO `login_history` VALUES (62, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 14:50:19', '成功');
INSERT INTO `login_history` VALUES (63, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 14:56:43', '成功');
INSERT INTO `login_history` VALUES (64, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 14:56:44', '成功');
INSERT INTO `login_history` VALUES (65, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 15:00:11', '成功');
INSERT INTO `login_history` VALUES (66, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 15:08:41', '成功');
INSERT INTO `login_history` VALUES (67, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 15:08:42', '成功');
INSERT INTO `login_history` VALUES (68, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 15:46:08', '成功');
INSERT INTO `login_history` VALUES (69, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 16:12:56', '成功');
INSERT INTO `login_history` VALUES (70, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 16:13:09', '成功');
INSERT INTO `login_history` VALUES (71, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 16:20:16', '成功');
INSERT INTO `login_history` VALUES (72, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 16:25:52', '成功');
INSERT INTO `login_history` VALUES (73, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 16:50:25', '成功');
INSERT INTO `login_history` VALUES (74, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 16:52:19', '成功');
INSERT INTO `login_history` VALUES (75, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 17:13:05', '成功');
INSERT INTO `login_history` VALUES (76, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 17:13:06', '成功');
INSERT INTO `login_history` VALUES (77, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 17:40:18', '成功');
INSERT INTO `login_history` VALUES (78, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 17:57:16', '成功');
INSERT INTO `login_history` VALUES (79, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 18:37:32', '成功');
INSERT INTO `login_history` VALUES (80, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 18:46:09', '成功');
INSERT INTO `login_history` VALUES (81, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 18:49:46', '成功');
INSERT INTO `login_history` VALUES (82, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 18:56:17', '成功');
INSERT INTO `login_history` VALUES (83, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 18:59:54', '成功');
INSERT INTO `login_history` VALUES (84, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-18 19:10:25', '成功');
INSERT INTO `login_history` VALUES (85, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 10:06:59', '成功');
INSERT INTO `login_history` VALUES (86, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 10:07:00', '成功');
INSERT INTO `login_history` VALUES (87, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 10:27:33', '成功');
INSERT INTO `login_history` VALUES (88, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 10:57:07', '成功');
INSERT INTO `login_history` VALUES (89, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 11:10:55', '成功');
INSERT INTO `login_history` VALUES (90, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 11:12:42', '成功');
INSERT INTO `login_history` VALUES (91, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 11:12:42', '成功');
INSERT INTO `login_history` VALUES (92, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 11:13:44', '成功');
INSERT INTO `login_history` VALUES (93, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 11:30:49', '成功');
INSERT INTO `login_history` VALUES (94, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 11:30:49', '成功');
INSERT INTO `login_history` VALUES (95, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 11:41:23', '成功');
INSERT INTO `login_history` VALUES (96, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 11:48:56', '成功');
INSERT INTO `login_history` VALUES (97, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 11:59:21', '成功');
INSERT INTO `login_history` VALUES (98, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 11:59:21', '成功');
INSERT INTO `login_history` VALUES (99, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 13:09:36', '成功');
INSERT INTO `login_history` VALUES (100, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 13:18:07', '成功');
INSERT INTO `login_history` VALUES (101, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 13:55:44', '成功');
INSERT INTO `login_history` VALUES (102, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 13:55:44', '成功');
INSERT INTO `login_history` VALUES (103, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 14:07:46', '成功');
INSERT INTO `login_history` VALUES (104, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 14:08:33', '成功');
INSERT INTO `login_history` VALUES (105, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 14:15:42', '成功');
INSERT INTO `login_history` VALUES (106, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 14:17:09', '成功');
INSERT INTO `login_history` VALUES (107, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 14:21:34', '成功');
INSERT INTO `login_history` VALUES (108, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 14:21:34', '成功');
INSERT INTO `login_history` VALUES (109, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 15:02:49', '成功');
INSERT INTO `login_history` VALUES (110, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 15:10:46', '成功');
INSERT INTO `login_history` VALUES (111, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-19 15:30:48', '成功');
INSERT INTO `login_history` VALUES (112, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 09:24:50', '成功');
INSERT INTO `login_history` VALUES (113, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 09:32:19', '成功');
INSERT INTO `login_history` VALUES (114, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 09:47:55', '成功');
INSERT INTO `login_history` VALUES (115, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 09:52:22', '成功');
INSERT INTO `login_history` VALUES (116, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 09:57:00', '成功');
INSERT INTO `login_history` VALUES (117, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 10:52:34', '成功');
INSERT INTO `login_history` VALUES (118, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 10:52:34', '成功');
INSERT INTO `login_history` VALUES (119, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 10:58:11', '成功');
INSERT INTO `login_history` VALUES (120, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 10:58:11', '成功');
INSERT INTO `login_history` VALUES (121, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 11:26:47', '成功');
INSERT INTO `login_history` VALUES (122, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 11:59:23', '成功');
INSERT INTO `login_history` VALUES (123, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 12:09:07', '成功');
INSERT INTO `login_history` VALUES (124, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 12:18:50', '成功');
INSERT INTO `login_history` VALUES (125, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 12:30:36', '成功');
INSERT INTO `login_history` VALUES (126, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 12:43:32', '成功');
INSERT INTO `login_history` VALUES (127, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 12:52:04', '成功');
INSERT INTO `login_history` VALUES (128, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 12:58:45', '成功');
INSERT INTO `login_history` VALUES (129, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 13:02:40', '成功');
INSERT INTO `login_history` VALUES (130, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 13:02:41', '成功');
INSERT INTO `login_history` VALUES (131, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 13:04:24', '成功');
INSERT INTO `login_history` VALUES (132, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 13:15:05', '成功');
INSERT INTO `login_history` VALUES (133, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 14:05:03', '成功');
INSERT INTO `login_history` VALUES (134, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 14:50:06', '成功');
INSERT INTO `login_history` VALUES (135, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 15:17:49', '成功');
INSERT INTO `login_history` VALUES (136, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 15:17:49', '成功');
INSERT INTO `login_history` VALUES (137, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 15:17:49', '成功');
INSERT INTO `login_history` VALUES (138, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 15:17:49', '成功');
INSERT INTO `login_history` VALUES (139, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 15:18:17', '成功');
INSERT INTO `login_history` VALUES (140, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 15:35:30', '成功');
INSERT INTO `login_history` VALUES (141, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 15:42:19', '成功');
INSERT INTO `login_history` VALUES (142, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:07:35', '成功');
INSERT INTO `login_history` VALUES (143, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:21:32', '成功');
INSERT INTO `login_history` VALUES (144, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:22:15', '成功');
INSERT INTO `login_history` VALUES (145, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:43:34', '成功');
INSERT INTO `login_history` VALUES (146, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:43:34', '成功');
INSERT INTO `login_history` VALUES (147, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:43:34', '成功');
INSERT INTO `login_history` VALUES (148, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:44:09', '成功');
INSERT INTO `login_history` VALUES (149, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:44:29', '成功');
INSERT INTO `login_history` VALUES (150, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:51:55', '成功');
INSERT INTO `login_history` VALUES (151, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:52:11', '成功');
INSERT INTO `login_history` VALUES (152, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:52:13', '成功');
INSERT INTO `login_history` VALUES (153, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 16:52:34', '成功');
INSERT INTO `login_history` VALUES (154, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 17:02:50', '成功');
INSERT INTO `login_history` VALUES (155, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 17:09:04', '成功');
INSERT INTO `login_history` VALUES (156, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 17:15:35', '成功');
INSERT INTO `login_history` VALUES (157, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 17:23:15', '成功');
INSERT INTO `login_history` VALUES (158, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 17:50:56', '成功');
INSERT INTO `login_history` VALUES (159, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 17:50:56', '成功');
INSERT INTO `login_history` VALUES (160, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-20 21:23:13', '成功');
INSERT INTO `login_history` VALUES (161, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 09:53:02', '成功');
INSERT INTO `login_history` VALUES (162, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 10:06:23', '成功');
INSERT INTO `login_history` VALUES (163, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 10:13:31', '成功');
INSERT INTO `login_history` VALUES (164, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 10:19:50', '成功');
INSERT INTO `login_history` VALUES (165, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 10:26:38', '成功');
INSERT INTO `login_history` VALUES (166, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 11:03:16', '成功');
INSERT INTO `login_history` VALUES (167, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 11:03:17', '成功');
INSERT INTO `login_history` VALUES (168, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 12:54:53', '成功');
INSERT INTO `login_history` VALUES (169, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 13:12:46', '成功');
INSERT INTO `login_history` VALUES (170, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 13:27:21', '成功');
INSERT INTO `login_history` VALUES (171, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 13:36:35', '成功');
INSERT INTO `login_history` VALUES (172, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 13:48:59', '成功');
INSERT INTO `login_history` VALUES (173, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 15:32:31', '成功');
INSERT INTO `login_history` VALUES (174, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 15:41:25', '成功');
INSERT INTO `login_history` VALUES (175, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 15:54:47', '成功');
INSERT INTO `login_history` VALUES (176, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 16:05:43', '成功');
INSERT INTO `login_history` VALUES (177, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 16:25:12', '成功');
INSERT INTO `login_history` VALUES (178, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 16:28:38', '成功');
INSERT INTO `login_history` VALUES (179, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 16:40:29', '成功');
INSERT INTO `login_history` VALUES (180, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 16:52:00', '成功');
INSERT INTO `login_history` VALUES (181, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 18:21:41', '成功');
INSERT INTO `login_history` VALUES (182, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 18:27:17', '成功');
INSERT INTO `login_history` VALUES (183, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 18:39:38', '成功');
INSERT INTO `login_history` VALUES (184, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 18:50:44', '成功');
INSERT INTO `login_history` VALUES (185, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 19:24:01', '成功');
INSERT INTO `login_history` VALUES (186, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 19:31:07', '成功');
INSERT INTO `login_history` VALUES (187, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 19:38:01', '成功');
INSERT INTO `login_history` VALUES (188, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 19:46:34', '成功');
INSERT INTO `login_history` VALUES (189, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 19:46:35', '成功');
INSERT INTO `login_history` VALUES (190, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 20:04:25', '成功');
INSERT INTO `login_history` VALUES (191, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 20:15:44', '成功');
INSERT INTO `login_history` VALUES (192, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 20:19:48', '成功');
INSERT INTO `login_history` VALUES (193, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 21:36:41', '成功');
INSERT INTO `login_history` VALUES (194, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 22:00:17', '成功');
INSERT INTO `login_history` VALUES (195, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 22:16:09', '成功');
INSERT INTO `login_history` VALUES (196, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-22 22:25:16', '成功');
INSERT INTO `login_history` VALUES (197, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 07:23:59', '成功');
INSERT INTO `login_history` VALUES (198, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 07:31:11', '成功');
INSERT INTO `login_history` VALUES (199, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 07:39:58', '成功');
INSERT INTO `login_history` VALUES (200, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 07:50:04', '成功');
INSERT INTO `login_history` VALUES (201, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 08:04:05', '成功');
INSERT INTO `login_history` VALUES (202, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 08:16:11', '成功');
INSERT INTO `login_history` VALUES (203, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 08:26:51', '成功');
INSERT INTO `login_history` VALUES (204, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 08:43:36', '成功');
INSERT INTO `login_history` VALUES (205, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 08:50:20', '成功');
INSERT INTO `login_history` VALUES (206, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 09:00:30', '成功');
INSERT INTO `login_history` VALUES (207, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 09:13:45', '成功');
INSERT INTO `login_history` VALUES (208, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 09:27:14', '成功');
INSERT INTO `login_history` VALUES (209, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 10:23:08', '成功');
INSERT INTO `login_history` VALUES (210, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 10:23:08', '成功');
INSERT INTO `login_history` VALUES (211, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 10:26:13', '成功');
INSERT INTO `login_history` VALUES (212, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 10:39:51', '成功');
INSERT INTO `login_history` VALUES (213, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 10:51:38', '成功');
INSERT INTO `login_history` VALUES (214, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-23 10:58:51', '成功');
INSERT INTO `login_history` VALUES (215, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-24 10:14:39', '成功');
INSERT INTO `login_history` VALUES (216, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-24 10:17:19', '成功');
INSERT INTO `login_history` VALUES (217, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-24 10:40:30', '成功');
INSERT INTO `login_history` VALUES (218, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-24 10:40:32', '成功');
INSERT INTO `login_history` VALUES (219, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-24 10:51:20', '成功');
INSERT INTO `login_history` VALUES (220, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-24 11:01:37', '成功');
INSERT INTO `login_history` VALUES (221, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-25 08:18:48', '成功');
INSERT INTO `login_history` VALUES (222, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-25 15:02:52', '成功');
INSERT INTO `login_history` VALUES (223, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-28 16:27:01', '成功');
INSERT INTO `login_history` VALUES (224, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-28 16:48:37', '成功');
INSERT INTO `login_history` VALUES (225, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-28 19:17:24', '成功');
INSERT INTO `login_history` VALUES (226, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-28 19:52:01', '成功');
INSERT INTO `login_history` VALUES (227, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-28 20:01:22', '成功');
INSERT INTO `login_history` VALUES (228, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-28 20:01:22', '成功');
INSERT INTO `login_history` VALUES (229, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 09:58:29', '成功');
INSERT INTO `login_history` VALUES (230, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 10:04:39', '成功');
INSERT INTO `login_history` VALUES (231, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 10:04:40', '成功');
INSERT INTO `login_history` VALUES (232, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 10:21:33', '成功');
INSERT INTO `login_history` VALUES (233, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 10:34:14', '成功');
INSERT INTO `login_history` VALUES (234, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 10:35:37', '成功');
INSERT INTO `login_history` VALUES (235, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 10:53:33', '成功');
INSERT INTO `login_history` VALUES (236, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 12:12:17', '成功');
INSERT INTO `login_history` VALUES (237, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 12:13:36', '成功');
INSERT INTO `login_history` VALUES (238, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 12:23:43', '成功');
INSERT INTO `login_history` VALUES (239, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 12:23:44', '成功');
INSERT INTO `login_history` VALUES (240, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 12:29:14', '成功');
INSERT INTO `login_history` VALUES (241, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 13:34:42', '成功');
INSERT INTO `login_history` VALUES (242, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 16:17:25', '成功');
INSERT INTO `login_history` VALUES (243, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 18:00:56', '成功');
INSERT INTO `login_history` VALUES (244, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 19:49:34', '成功');
INSERT INTO `login_history` VALUES (245, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 19:49:35', '成功');
INSERT INTO `login_history` VALUES (246, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 20:04:44', '成功');
INSERT INTO `login_history` VALUES (247, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 22:59:19', '成功');
INSERT INTO `login_history` VALUES (248, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 23:04:31', '成功');
INSERT INTO `login_history` VALUES (249, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 23:04:32', '成功');
INSERT INTO `login_history` VALUES (250, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-29 23:06:27', '成功');
INSERT INTO `login_history` VALUES (251, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-30 11:57:37', '成功');
INSERT INTO `login_history` VALUES (252, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-30 12:02:38', '成功');
INSERT INTO `login_history` VALUES (253, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-30 12:21:53', '成功');
INSERT INTO `login_history` VALUES (254, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-30 12:33:16', '成功');
INSERT INTO `login_history` VALUES (255, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-30 12:43:45', '成功');
INSERT INTO `login_history` VALUES (256, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-30 12:53:49', '成功');
INSERT INTO `login_history` VALUES (257, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-09-30 16:44:52', '成功');
INSERT INTO `login_history` VALUES (258, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-03 16:02:37', '成功');
INSERT INTO `login_history` VALUES (259, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-03 16:05:31', '成功');
INSERT INTO `login_history` VALUES (260, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-03 16:14:41', '成功');
INSERT INTO `login_history` VALUES (261, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-03 18:51:52', '成功');
INSERT INTO `login_history` VALUES (262, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-03 19:05:11', '成功');
INSERT INTO `login_history` VALUES (263, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-03 19:29:00', '成功');
INSERT INTO `login_history` VALUES (264, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-03 20:27:09', '成功');
INSERT INTO `login_history` VALUES (265, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-04 00:13:02', '成功');
INSERT INTO `login_history` VALUES (266, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 01:11:27', '成功');
INSERT INTO `login_history` VALUES (267, 53, '0a6bf6e1360251c5', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 01:21:14', '成功');
INSERT INTO `login_history` VALUES (268, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 10:31:56', '成功');
INSERT INTO `login_history` VALUES (269, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 10:41:31', '成功');
INSERT INTO `login_history` VALUES (270, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 10:50:31', '成功');
INSERT INTO `login_history` VALUES (271, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 11:00:04', '成功');
INSERT INTO `login_history` VALUES (272, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 11:25:13', '成功');
INSERT INTO `login_history` VALUES (273, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 12:29:35', '成功');
INSERT INTO `login_history` VALUES (274, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 13:04:34', '成功');
INSERT INTO `login_history` VALUES (275, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 13:23:46', '成功');
INSERT INTO `login_history` VALUES (276, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 13:30:22', '成功');
INSERT INTO `login_history` VALUES (277, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 13:34:39', '成功');
INSERT INTO `login_history` VALUES (278, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 13:39:27', '成功');
INSERT INTO `login_history` VALUES (279, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 13:55:19', '成功');
INSERT INTO `login_history` VALUES (280, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 13:57:47', '成功');
INSERT INTO `login_history` VALUES (281, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 14:06:18', '成功');
INSERT INTO `login_history` VALUES (282, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 14:14:55', '成功');
INSERT INTO `login_history` VALUES (283, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 14:20:42', '成功');
INSERT INTO `login_history` VALUES (284, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 14:30:54', '成功');
INSERT INTO `login_history` VALUES (285, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 15:04:52', '成功');
INSERT INTO `login_history` VALUES (286, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 15:09:50', '成功');
INSERT INTO `login_history` VALUES (287, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-11 18:19:31', '成功');
INSERT INTO `login_history` VALUES (288, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-11 18:19:31', '成功');
INSERT INTO `login_history` VALUES (289, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-11 19:10:57', '成功');
INSERT INTO `login_history` VALUES (290, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-11 19:16:44', '成功');
INSERT INTO `login_history` VALUES (291, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-11 19:17:34', '成功');
INSERT INTO `login_history` VALUES (292, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-11 19:17:35', '成功');
INSERT INTO `login_history` VALUES (293, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-12 09:09:35', '成功');
INSERT INTO `login_history` VALUES (294, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-12 09:09:35', '成功');
INSERT INTO `login_history` VALUES (295, 53, 'f92ddf87d2e8c5ee', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-12 09:09:35', '成功');
INSERT INTO `login_history` VALUES (296, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 16:57:59', '成功');
INSERT INTO `login_history` VALUES (297, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 17:31:36', '成功');
INSERT INTO `login_history` VALUES (298, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 19:01:27', '成功');
INSERT INTO `login_history` VALUES (299, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 19:34:07', '成功');
INSERT INTO `login_history` VALUES (300, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 19:35:10', '成功');
INSERT INTO `login_history` VALUES (301, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 19:35:11', '成功');
INSERT INTO `login_history` VALUES (302, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 19:43:21', '成功');
INSERT INTO `login_history` VALUES (303, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 19:48:57', '成功');
INSERT INTO `login_history` VALUES (304, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 19:48:58', '成功');
INSERT INTO `login_history` VALUES (305, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 19:55:40', '成功');
INSERT INTO `login_history` VALUES (306, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 20:03:21', '成功');
INSERT INTO `login_history` VALUES (307, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 20:09:45', '成功');
INSERT INTO `login_history` VALUES (308, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 20:21:12', '成功');
INSERT INTO `login_history` VALUES (309, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 20:29:47', '成功');
INSERT INTO `login_history` VALUES (310, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 20:52:07', '成功');
INSERT INTO `login_history` VALUES (311, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 21:00:19', '成功');
INSERT INTO `login_history` VALUES (312, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 21:08:42', '成功');
INSERT INTO `login_history` VALUES (313, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 21:21:06', '成功');
INSERT INTO `login_history` VALUES (314, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 21:32:49', '成功');
INSERT INTO `login_history` VALUES (315, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 22:01:28', '成功');
INSERT INTO `login_history` VALUES (316, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 22:05:41', '成功');
INSERT INTO `login_history` VALUES (317, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 22:10:35', '成功');
INSERT INTO `login_history` VALUES (318, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 22:10:36', '成功');
INSERT INTO `login_history` VALUES (319, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 22:17:02', '成功');
INSERT INTO `login_history` VALUES (320, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 22:27:13', '成功');
INSERT INTO `login_history` VALUES (321, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-04 22:27:14', '成功');
INSERT INTO `login_history` VALUES (322, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 10:06:59', '成功');
INSERT INTO `login_history` VALUES (323, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 10:26:26', '成功');
INSERT INTO `login_history` VALUES (324, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 10:34:25', '成功');
INSERT INTO `login_history` VALUES (325, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 10:34:27', '成功');
INSERT INTO `login_history` VALUES (326, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 10:48:52', '成功');
INSERT INTO `login_history` VALUES (327, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 10:53:28', '成功');
INSERT INTO `login_history` VALUES (328, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 11:14:05', '成功');
INSERT INTO `login_history` VALUES (329, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 11:22:13', '成功');
INSERT INTO `login_history` VALUES (330, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 11:31:12', '成功');
INSERT INTO `login_history` VALUES (331, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 12:59:47', '成功');
INSERT INTO `login_history` VALUES (332, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 13:03:00', '成功');
INSERT INTO `login_history` VALUES (333, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 13:05:59', '成功');
INSERT INTO `login_history` VALUES (334, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-05 13:16:08', '成功');
INSERT INTO `login_history` VALUES (335, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-06 10:09:13', '成功');
INSERT INTO `login_history` VALUES (336, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-06 10:09:13', '成功');
INSERT INTO `login_history` VALUES (337, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-06 12:41:17', '成功');
INSERT INTO `login_history` VALUES (338, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-20 14:30:57', '成功');
INSERT INTO `login_history` VALUES (339, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-20 14:37:30', '成功');
INSERT INTO `login_history` VALUES (340, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-21 11:13:26', '成功');
INSERT INTO `login_history` VALUES (341, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-21 11:13:26', '成功');
INSERT INTO `login_history` VALUES (342, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-22 11:08:04', '成功');
INSERT INTO `login_history` VALUES (343, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-22 11:08:04', '成功');
INSERT INTO `login_history` VALUES (344, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-22 11:08:06', '成功');
INSERT INTO `login_history` VALUES (345, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-11-22 11:11:36', '成功');
INSERT INTO `login_history` VALUES (346, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', 'unknown', '未知位置', '2025-12-07 14:46:37', '成功');
INSERT INTO `login_history` VALUES (347, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', 'unknown', '未知位置', '2025-12-07 14:46:37', '成功');
INSERT INTO `login_history` VALUES (348, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', 'unknown', '未知位置', '2025-12-07 14:46:37', '成功');
INSERT INTO `login_history` VALUES (349, 53, '0ca0626aa88dd0e6', 'Chrome', 'Windows', 'unknown', '未知位置', '2025-12-07 14:46:37', '成功');
INSERT INTO `login_history` VALUES (350, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-19 13:46:05', '成功');
INSERT INTO `login_history` VALUES (351, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-19 14:07:36', '成功');
INSERT INTO `login_history` VALUES (352, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-19 14:10:44', '成功');
INSERT INTO `login_history` VALUES (353, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-19 14:14:49', '成功');
INSERT INTO `login_history` VALUES (354, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-19 14:27:09', '成功');
INSERT INTO `login_history` VALUES (355, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-19 14:45:18', '成功');
INSERT INTO `login_history` VALUES (356, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-19 14:48:30', '成功');
INSERT INTO `login_history` VALUES (357, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-19 14:49:30', '成功');
INSERT INTO `login_history` VALUES (358, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-19 14:53:59', '成功');
INSERT INTO `login_history` VALUES (359, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-19 15:07:00', '成功');
INSERT INTO `login_history` VALUES (360, 53, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 12:15:27', '成功');
INSERT INTO `login_history` VALUES (361, 53, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 14:34:13', '成功');
INSERT INTO `login_history` VALUES (362, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 14:38:09', '成功');
INSERT INTO `login_history` VALUES (363, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 14:39:34', '成功');
INSERT INTO `login_history` VALUES (364, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 14:40:23', '成功');
INSERT INTO `login_history` VALUES (365, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 14:44:47', '成功');
INSERT INTO `login_history` VALUES (366, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 14:46:23', '成功');
INSERT INTO `login_history` VALUES (367, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 14:46:23', '成功');
INSERT INTO `login_history` VALUES (368, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 14:48:20', '成功');
INSERT INTO `login_history` VALUES (369, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 15:00:50', '成功');
INSERT INTO `login_history` VALUES (370, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 15:00:50', '成功');
INSERT INTO `login_history` VALUES (371, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 15:03:02', '成功');
INSERT INTO `login_history` VALUES (372, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 15:03:03', '成功');
INSERT INTO `login_history` VALUES (373, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 15:25:27', '成功');
INSERT INTO `login_history` VALUES (374, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 15:52:52', '成功');
INSERT INTO `login_history` VALUES (375, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 15:52:52', '成功');
INSERT INTO `login_history` VALUES (376, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 15:57:50', '成功');
INSERT INTO `login_history` VALUES (377, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 16:01:52', '成功');
INSERT INTO `login_history` VALUES (378, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 16:20:24', '成功');
INSERT INTO `login_history` VALUES (379, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 16:24:33', '成功');
INSERT INTO `login_history` VALUES (380, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 16:24:34', '成功');
INSERT INTO `login_history` VALUES (381, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 16:26:58', '成功');
INSERT INTO `login_history` VALUES (382, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 16:34:20', '成功');
INSERT INTO `login_history` VALUES (383, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 16:41:30', '成功');
INSERT INTO `login_history` VALUES (384, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 16:49:36', '成功');
INSERT INTO `login_history` VALUES (385, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 16:49:36', '成功');
INSERT INTO `login_history` VALUES (386, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 17:00:12', '成功');
INSERT INTO `login_history` VALUES (387, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 17:03:50', '成功');
INSERT INTO `login_history` VALUES (388, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 17:25:15', '成功');
INSERT INTO `login_history` VALUES (389, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 17:26:42', '成功');
INSERT INTO `login_history` VALUES (390, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 17:36:23', '成功');
INSERT INTO `login_history` VALUES (391, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 17:47:08', '成功');
INSERT INTO `login_history` VALUES (392, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 17:52:21', '成功');
INSERT INTO `login_history` VALUES (393, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 18:00:55', '成功');
INSERT INTO `login_history` VALUES (394, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 18:06:54', '成功');
INSERT INTO `login_history` VALUES (395, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 18:10:30', '成功');
INSERT INTO `login_history` VALUES (396, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 18:13:17', '成功');
INSERT INTO `login_history` VALUES (397, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 18:37:39', '成功');
INSERT INTO `login_history` VALUES (398, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 18:44:39', '成功');
INSERT INTO `login_history` VALUES (399, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 18:48:02', '成功');
INSERT INTO `login_history` VALUES (400, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 18:49:23', '成功');
INSERT INTO `login_history` VALUES (401, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 18:52:35', '成功');
INSERT INTO `login_history` VALUES (402, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 18:53:25', '成功');
INSERT INTO `login_history` VALUES (403, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 19:06:12', '成功');
INSERT INTO `login_history` VALUES (404, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 19:07:58', '成功');
INSERT INTO `login_history` VALUES (405, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 19:17:26', '成功');
INSERT INTO `login_history` VALUES (406, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 19:19:05', '成功');
INSERT INTO `login_history` VALUES (407, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 19:19:05', '成功');
INSERT INTO `login_history` VALUES (408, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.164', '辽宁省 · 葫芦岛市', '2026-03-22 20:02:43', '成功');
INSERT INTO `login_history` VALUES (409, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.164', '辽宁省 · 葫芦岛市', '2026-03-22 20:09:45', '成功');
INSERT INTO `login_history` VALUES (410, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.164', '辽宁省 · 葫芦岛市', '2026-03-22 20:16:01', '成功');
INSERT INTO `login_history` VALUES (411, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.164', '辽宁省 · 葫芦岛市', '2026-03-22 20:18:00', '成功');
INSERT INTO `login_history` VALUES (412, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.164', '辽宁省 · 葫芦岛市', '2026-03-22 20:35:21', '成功');
INSERT INTO `login_history` VALUES (413, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 15:27:49', '成功');
INSERT INTO `login_history` VALUES (414, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 15:48:41', '成功');
INSERT INTO `login_history` VALUES (415, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 15:59:14', '成功');
INSERT INTO `login_history` VALUES (416, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 16:08:18', '成功');
INSERT INTO `login_history` VALUES (417, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 16:26:26', '成功');
INSERT INTO `login_history` VALUES (418, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 16:34:58', '成功');
INSERT INTO `login_history` VALUES (419, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 16:43:09', '成功');
INSERT INTO `login_history` VALUES (420, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 16:48:08', '成功');
INSERT INTO `login_history` VALUES (421, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 16:58:11', '成功');
INSERT INTO `login_history` VALUES (422, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 17:07:12', '成功');
INSERT INTO `login_history` VALUES (423, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 17:13:24', '成功');
INSERT INTO `login_history` VALUES (424, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 17:23:05', '成功');
INSERT INTO `login_history` VALUES (425, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 17:31:18', '成功');
INSERT INTO `login_history` VALUES (426, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 17:31:19', '成功');
INSERT INTO `login_history` VALUES (427, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 17:39:36', '成功');
INSERT INTO `login_history` VALUES (428, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 17:42:01', '成功');
INSERT INTO `login_history` VALUES (429, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 17:51:13', '成功');
INSERT INTO `login_history` VALUES (430, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 17:55:17', '成功');
INSERT INTO `login_history` VALUES (431, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 17:56:25', '成功');
INSERT INTO `login_history` VALUES (432, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:04:21', '成功');
INSERT INTO `login_history` VALUES (433, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:10:56', '成功');
INSERT INTO `login_history` VALUES (434, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:17:06', '成功');
INSERT INTO `login_history` VALUES (435, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:24:17', '成功');
INSERT INTO `login_history` VALUES (436, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:24:17', '成功');
INSERT INTO `login_history` VALUES (437, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:27:32', '成功');
INSERT INTO `login_history` VALUES (438, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:29:34', '成功');
INSERT INTO `login_history` VALUES (439, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:31:53', '成功');
INSERT INTO `login_history` VALUES (440, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:31:54', '成功');
INSERT INTO `login_history` VALUES (441, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:31:54', '成功');
INSERT INTO `login_history` VALUES (442, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:36:19', '成功');
INSERT INTO `login_history` VALUES (443, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:36:20', '成功');
INSERT INTO `login_history` VALUES (444, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:40:14', '成功');
INSERT INTO `login_history` VALUES (445, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 18:48:59', '成功');
INSERT INTO `login_history` VALUES (446, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 19:03:59', '成功');
INSERT INTO `login_history` VALUES (447, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 19:12:53', '成功');
INSERT INTO `login_history` VALUES (448, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 19:13:11', '成功');
INSERT INTO `login_history` VALUES (449, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 19:14:13', '成功');
INSERT INTO `login_history` VALUES (450, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 19:15:01', '成功');
INSERT INTO `login_history` VALUES (451, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 19:30:56', '成功');
INSERT INTO `login_history` VALUES (452, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 19:42:58', '成功');
INSERT INTO `login_history` VALUES (453, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 19:45:32', '成功');
INSERT INTO `login_history` VALUES (454, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 19:48:03', '成功');
INSERT INTO `login_history` VALUES (455, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 19:55:50', '成功');
INSERT INTO `login_history` VALUES (456, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 20:02:01', '成功');
INSERT INTO `login_history` VALUES (457, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 20:06:33', '成功');
INSERT INTO `login_history` VALUES (458, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 20:09:09', '成功');
INSERT INTO `login_history` VALUES (459, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 20:14:39', '成功');
INSERT INTO `login_history` VALUES (460, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 20:17:22', '成功');
INSERT INTO `login_history` VALUES (461, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-23 20:20:10', '成功');
INSERT INTO `login_history` VALUES (462, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 15:43:19', '成功');
INSERT INTO `login_history` VALUES (463, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 15:48:48', '成功');
INSERT INTO `login_history` VALUES (464, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 15:55:30', '成功');
INSERT INTO `login_history` VALUES (465, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 15:57:26', '成功');
INSERT INTO `login_history` VALUES (466, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 16:11:05', '成功');
INSERT INTO `login_history` VALUES (467, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 16:15:51', '成功');
INSERT INTO `login_history` VALUES (468, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 16:27:02', '成功');
INSERT INTO `login_history` VALUES (469, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 16:30:43', '成功');
INSERT INTO `login_history` VALUES (470, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 16:30:43', '成功');
INSERT INTO `login_history` VALUES (471, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 16:31:46', '成功');
INSERT INTO `login_history` VALUES (472, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 16:40:58', '成功');
INSERT INTO `login_history` VALUES (473, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 16:42:42', '成功');
INSERT INTO `login_history` VALUES (474, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 16:49:43', '成功');
INSERT INTO `login_history` VALUES (475, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 16:51:01', '成功');
INSERT INTO `login_history` VALUES (476, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:10:59', '成功');
INSERT INTO `login_history` VALUES (477, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:19:01', '成功');
INSERT INTO `login_history` VALUES (478, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:36:32', '成功');
INSERT INTO `login_history` VALUES (479, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:37:57', '成功');
INSERT INTO `login_history` VALUES (480, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:38:33', '成功');
INSERT INTO `login_history` VALUES (481, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:40:08', '成功');
INSERT INTO `login_history` VALUES (482, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:45:17', '成功');
INSERT INTO `login_history` VALUES (483, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:51:31', '成功');
INSERT INTO `login_history` VALUES (484, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:52:15', '成功');
INSERT INTO `login_history` VALUES (485, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:53:45', '成功');
INSERT INTO `login_history` VALUES (486, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 17:57:19', '成功');
INSERT INTO `login_history` VALUES (487, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 18:01:10', '成功');
INSERT INTO `login_history` VALUES (488, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 18:02:51', '成功');
INSERT INTO `login_history` VALUES (489, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 18:13:57', '成功');
INSERT INTO `login_history` VALUES (490, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 18:15:09', '成功');
INSERT INTO `login_history` VALUES (491, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 18:43:12', '成功');
INSERT INTO `login_history` VALUES (492, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 19:38:30', '成功');
INSERT INTO `login_history` VALUES (493, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 19:59:22', '成功');
INSERT INTO `login_history` VALUES (494, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 20:02:13', '成功');
INSERT INTO `login_history` VALUES (495, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 20:13:05', '成功');
INSERT INTO `login_history` VALUES (496, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 20:30:20', '成功');
INSERT INTO `login_history` VALUES (497, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 20:34:46', '成功');
INSERT INTO `login_history` VALUES (498, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 20:58:46', '成功');
INSERT INTO `login_history` VALUES (499, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-24 20:58:46', '成功');
INSERT INTO `login_history` VALUES (500, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 18:39:14', '成功');
INSERT INTO `login_history` VALUES (501, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 18:45:19', '成功');
INSERT INTO `login_history` VALUES (502, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 18:55:55', '成功');
INSERT INTO `login_history` VALUES (503, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:00:36', '成功');
INSERT INTO `login_history` VALUES (504, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:00:36', '成功');
INSERT INTO `login_history` VALUES (505, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:00:37', '成功');
INSERT INTO `login_history` VALUES (506, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:00:37', '成功');
INSERT INTO `login_history` VALUES (507, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:00:38', '成功');
INSERT INTO `login_history` VALUES (508, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:01:15', '成功');
INSERT INTO `login_history` VALUES (509, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:14:37', '成功');
INSERT INTO `login_history` VALUES (510, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:18:44', '成功');
INSERT INTO `login_history` VALUES (511, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:47:34', '成功');
INSERT INTO `login_history` VALUES (512, 96, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:47:35', '成功');
INSERT INTO `login_history` VALUES (513, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 10:01:03', '成功');
INSERT INTO `login_history` VALUES (514, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 10:42:33', '成功');
INSERT INTO `login_history` VALUES (515, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 10:58:09', '成功');
INSERT INTO `login_history` VALUES (516, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 10:58:09', '成功');
INSERT INTO `login_history` VALUES (517, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 10:58:57', '成功');
INSERT INTO `login_history` VALUES (518, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:19:05', '成功');
INSERT INTO `login_history` VALUES (519, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:19:06', '成功');
INSERT INTO `login_history` VALUES (520, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:24:19', '成功');
INSERT INTO `login_history` VALUES (521, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:24:19', '成功');
INSERT INTO `login_history` VALUES (522, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:25:55', '成功');
INSERT INTO `login_history` VALUES (523, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:31:40', '成功');
INSERT INTO `login_history` VALUES (524, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:31:41', '成功');
INSERT INTO `login_history` VALUES (525, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:31:41', '成功');
INSERT INTO `login_history` VALUES (526, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:36:12', '成功');
INSERT INTO `login_history` VALUES (527, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:39:38', '成功');
INSERT INTO `login_history` VALUES (528, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:43:35', '成功');
INSERT INTO `login_history` VALUES (529, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:46:27', '成功');
INSERT INTO `login_history` VALUES (530, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:46:41', '成功');
INSERT INTO `login_history` VALUES (531, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:48:53', '成功');
INSERT INTO `login_history` VALUES (532, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 11:50:23', '成功');
INSERT INTO `login_history` VALUES (533, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 12:21:02', '成功');
INSERT INTO `login_history` VALUES (534, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 12:22:26', '成功');
INSERT INTO `login_history` VALUES (535, 97, 'e01c7405c82bf25d', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 12:28:49', '成功');
INSERT INTO `login_history` VALUES (536, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-29 14:27:15', '成功');
INSERT INTO `login_history` VALUES (537, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-29 14:34:24', '成功');
INSERT INTO `login_history` VALUES (538, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-30 13:42:43', '成功');
INSERT INTO `login_history` VALUES (539, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-30 13:42:43', '成功');
INSERT INTO `login_history` VALUES (540, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-30 13:45:57', '成功');
INSERT INTO `login_history` VALUES (541, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-30 13:45:58', '成功');
INSERT INTO `login_history` VALUES (542, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-30 13:47:23', '成功');
INSERT INTO `login_history` VALUES (543, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-30 13:47:24', '成功');
INSERT INTO `login_history` VALUES (544, 53, '9f4c6722da403f48', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-30 13:57:35', '成功');

-- ----------------------------
-- Table structure for materials
-- ----------------------------
DROP TABLE IF EXISTS `materials`;
CREATE TABLE `materials`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `type` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `uploader_id` int NOT NULL,
  `category` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `status` int NULL DEFAULT 0,
  `upload_time` datetime NOT NULL,
  `path` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `reject_reason` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `file_size` bigint NULL DEFAULT NULL,
  `download_count` int NULL DEFAULT 0,
  `view_count` int NULL DEFAULT 0,
  `tags` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `version` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `language` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `is_featured` tinyint NULL DEFAULT 0,
  `featured_order` int NULL DEFAULT 0,
  `thumbnail_path` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `uploader_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `original_filename` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `project_id` bigint NULL DEFAULT NULL COMMENT '所属项目ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `51`(`uploader_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of materials
-- ----------------------------
INSERT INTO `materials` VALUES (9, '项目需求文档', 'docx', 56, '需求文档', 1, '2025-09-14 09:54:15', '/docs/requirements.docx', NULL, '项目主要功能需求说明', 1024000, 17, 46, '需求,功能', '1.0', '中文', 0, 0, NULL, 'zwt', '项目需求说明书.docx', 1);
INSERT INTO `materials` VALUES (10, '系统架构设计', 'pdf', 56, '设计文档', 1, '2025-09-14 09:54:15', '/docs/architecture.pdf', NULL, '系统整体架构设计说明', 2048000, 23, 67, '架构,设计', '2.1', '中文', 0, 0, NULL, 'zwt', '系统架构设计文档.pdf', 1);
INSERT INTO `materials` VALUES (11, '数据库设计', 'xlsx', 56, '设计文档', 1, '2025-09-14 09:54:15', '/docs/database.xlsx', NULL, '数据库表结构设计', 512000, 18, 52, '数据库,设计', '1.5', '中文', 0, 0, NULL, 'zwt', '数据库设计表.xlsx', 1);
INSERT INTO `materials` VALUES (12, '用户手册', 'pdf', 56, '用户文档', 1, '2025-09-14 09:54:15', '/docs/user_manual.pdf', NULL, '系统使用说明手册', 1536000, 32, 89, '用户,手册', '3.0', '中文', 0, 0, NULL, 'zwt', '用户使用手册.pdf', 1);
INSERT INTO `materials` VALUES (13, 'API接口文档', 'md', 56, '开发文档', 1, '2025-09-14 09:54:15', '/docs/api.md', NULL, '系统API接口说明', 256000, 27, 73, 'API,接口', '2.0', '中文', 0, 0, NULL, 'zwt', 'API接口文档.md', 1);
INSERT INTO `materials` VALUES (14, '测试报告', 'docx', 56, '测试文档', 1, '2025-09-14 09:54:15', '/docs/test_report.docx', NULL, '系统测试结果报告', 768000, 12, 34, '测试,报告', '1.2', '中文', 0, 0, NULL, 'zwt', '测试报告.docx', 1);
INSERT INTO `materials` VALUES (15, '部署指南', 'pdf', 56, '运维文档', 1, '2025-09-14 09:54:15', '/docs/deployment.pdf', NULL, '系统部署安装指南', 896000, 19, 41, '部署,运维', '2.3', '中文', 0, 0, NULL, 'zwt', '部署指南.pdf', 1);
INSERT INTO `materials` VALUES (16, '1', 'pdf', 97, 'general', 1, '2026-03-28 11:47:02', '032f7254-c1c3-45e9-a7ff-ba1fb7bc61c4.xls', NULL, '1', 21399, NULL, NULL, '1', '1', 'zh', 0, 0, NULL, 'xsz', '2520010123_谢桑梓(学生课表).xls', 1);
INSERT INTO `materials` VALUES (17, '2025年软件学院推荐优秀应届本科毕业生免试攻读研究生工作细则(草案版)', 'PDF', 53, 'LEARNING', 1, '2026-03-30 13:25:30', '6e1b1153-589a-47ee-bc20-51b86d9c785d.pdf', NULL, '保研参考方向', 195444, NULL, NULL, '【学习】【保研】', '1.0', 'zh', 0, 0, NULL, '曾文涛', '2025年软件学院推荐优秀应届本科毕业生免试攻读研究生工作细则(草案版)(1)(2).pdf', NULL);

-- ----------------------------
-- Table structure for meeting
-- ----------------------------
DROP TABLE IF EXISTS `meeting`;
CREATE TABLE `meeting`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `content` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `organizer` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `meeting_time` datetime NULL DEFAULT NULL,
  `status` int NULL DEFAULT NULL,
  `review_comment` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `10`(`organizer` ASC) USING BTREE,
  CONSTRAINT `10` FOREIGN KEY (`organizer`) REFERENCES `users` (`username`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 76 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of meeting
-- ----------------------------
INSERT INTO `meeting` VALUES (61, '项目启动会议', '讨论新项目的初始规划和分工', '董胜阳', '2025-11-01 14:00:00', 1, '会议内容详细，组织良好');
INSERT INTO `meeting` VALUES (62, '季度评审会议', '回顾本季度业绩并制定下季度目标', '刘睿翔', '2025-09-18 09:30:00', 0, NULL);
INSERT INTO `meeting` VALUES (63, '技术分享会', '团队成员分享最新技术趋势和实践', '曾文涛', '2025-09-26 15:00:00', 2, '参会人员积极参与讨论');
INSERT INTO `meeting` VALUES (64, '产品需求评审', '评审新产品的功能需求和设计', '董胜阳', '2025-09-28 10:00:00', 1, NULL);
INSERT INTO `meeting` VALUES (65, '团队周例会', '每周团队进度同步和问题讨论', '刘睿翔', '2025-09-30 09:00:00', 3, '会议记录已归档');
INSERT INTO `meeting` VALUES (66, '客户演示准备', '准备下周客户演示的内容和材料', '曾文涛', '2025-09-22 14:30:00', 1, '需要更多案例支持');
INSERT INTO `meeting` VALUES (67, '代码审查会议', '审查新功能代码质量和规范', '董胜阳', '2025-09-30 16:00:00', 0, NULL);
INSERT INTO `meeting` VALUES (68, '项目里程碑评审', '评审项目当前里程碑完成情况', '刘睿翔', '2025-10-02 11:00:00', 1, NULL);
INSERT INTO `meeting` VALUES (69, '培训会议', '新工具和技术栈培训', '曾文涛', '2023-10-30 13:00:00', 1, '需要准备更多实操案例');
INSERT INTO `meeting` VALUES (70, '紧急问题处理', '处理生产环境出现的紧急问题', '董胜阳', '2023-10-05 15:30:00', 3, '问题已解决，需编写事故报告');
INSERT INTO `meeting` VALUES (71, '年度规划会议', '讨论明年团队目标和规划', '刘睿翔', '2023-11-05 09:00:00', 1, NULL);
INSERT INTO `meeting` VALUES (72, '跨部门协作会议', '与其他部门讨论合作项目', '曾文涛', '2023-10-17 10:30:00', 2, '需要明确各方责任');
INSERT INTO `meeting` VALUES (73, '系统架构讨论', '讨论新系统架构设计方案', '董胜阳', '2023-10-19 14:00:00', 0, NULL);
INSERT INTO `meeting` VALUES (74, '用户体验优化', '讨论产品用户体验改进方案', '刘睿翔', '2023-10-23 15:00:00', 1, NULL);
INSERT INTO `meeting` VALUES (75, '项目总结会议', '总结已完成项目的经验教训', '曾文涛', '2023-10-27 16:30:00', 1, '需要整理成功案例');

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `type` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `is_read` tinyint NULL DEFAULT 0,
  `created_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_notifications_unread`(`is_read` ASC, `created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 67 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of notifications
-- ----------------------------
INSERT INTO `notifications` VALUES (54, '[CREATE_TASK] TASK: 创建任务: 2', 'AUDIT', 1, '2025-08-22 11:00:59');
INSERT INTO `notifications` VALUES (55, '[APPROVE_TASK] TASK: 审核任务: 2, 结果: 通过, 备注: ', 'AUDIT', 1, '2025-08-22 11:01:04');
INSERT INTO `notifications` VALUES (56, '[DELETE_TASK] TASK: 删除任务: 2', 'AUDIT', 1, '2025-08-22 11:01:08');
INSERT INTO `notifications` VALUES (57, '[PASSWORD_CHANGE] USER: 用户修改密码成功', 'SECURITY', 0, '2025-09-17 22:36:34');
INSERT INTO `notifications` VALUES (58, '[CREATE_TASK] TASK: 创建任务: 3', 'AUDIT', 0, '2025-09-20 17:23:40');
INSERT INTO `notifications` VALUES (59, '[REGISTER] USER: 新用户注册申请: 西兰花 (2240423956@qq.com)', 'REGISTER_AUDIT', 0, '2026-03-22 13:44:55');
INSERT INTO `notifications` VALUES (60, '[CREATE_TASK] TASK: 创建任务: 外卖配送服务', 'AUDIT', 0, '2026-03-23 18:40:28');
INSERT INTO `notifications` VALUES (61, '[REGISTER] USER: 新用户注册申请: xsz (WhiteMourning@Foxmail.com)', 'REGISTER_AUDIT', 0, '2026-03-28 10:00:10');
INSERT INTO `notifications` VALUES (62, '[APPROVE_TASK] TASK: 审核任务: 外卖配送服务, 结果: 通过, 备注: 无问题', 'AUDIT', 0, '2026-03-30 13:28:38');
INSERT INTO `notifications` VALUES (63, '[CREATE_TASK] TASK: 创建任务: 1', 'AUDIT', 0, '2026-03-30 13:34:24');
INSERT INTO `notifications` VALUES (64, '[DELETE_TASK] TASK: 删除任务: 1', 'AUDIT', 0, '2026-03-30 13:34:27');
INSERT INTO `notifications` VALUES (65, '[CREATE_TASK] TASK: 创建任务: 1', 'AUDIT', 0, '2026-03-30 13:34:40');
INSERT INTO `notifications` VALUES (66, '[DELETE_TASK] TASK: 删除任务: 1', 'AUDIT', 0, '2026-03-30 13:34:42');

-- ----------------------------
-- Table structure for organization_members
-- ----------------------------
DROP TABLE IF EXISTS `organization_members`;
CREATE TABLE `organization_members`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `org_id` bigint NOT NULL COMMENT '组织架构ID',
  `team_member_id` bigint NOT NULL COMMENT '团队成员ID',
  `position` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '在组织中的职位',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_org_member`(`org_id` ASC, `team_member_id` ASC) USING BTREE,
  INDEX `idx_org_id`(`org_id` ASC) USING BTREE,
  INDEX `idx_team_member_id`(`team_member_id` ASC) USING BTREE,
  CONSTRAINT `organization_members_ibfk_1` FOREIGN KEY (`org_id`) REFERENCES `organization_structure` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `organization_members_ibfk_2` FOREIGN KEY (`team_member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin COMMENT = '组织成员明细表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of organization_members
-- ----------------------------
INSERT INTO `organization_members` VALUES (1, 1, 14, '董事长', '2026-03-20 16:36:49');
INSERT INTO `organization_members` VALUES (2, 2, 15, '技术总监', '2026-03-20 16:36:49');
INSERT INTO `organization_members` VALUES (3, 5, 16, '前端组长', '2026-03-20 16:36:49');
INSERT INTO `organization_members` VALUES (4, 1, 17, '董事', '2026-03-20 16:36:49');

-- ----------------------------
-- Table structure for organization_structure
-- ----------------------------
DROP TABLE IF EXISTS `organization_structure`;
CREATE TABLE `organization_structure`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL COMMENT '组织名称',
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL COMMENT '组织描述',
  `parent_id` bigint NULL DEFAULT NULL COMMENT '父组织ID，根组织为NULL',
  `team_id` bigint NULL DEFAULT NULL COMMENT '关联团队ID，根组织关联teams表中的董事会',
  `level` int NULL DEFAULT 1 COMMENT '组织层级',
  `icon` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'users' COMMENT '组织图标',
  `badge_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'normal' COMMENT '徽章类型：high(高层), core(核心), key(关键), business(业务)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `idx_team_id`(`team_id` ASC) USING BTREE,
  CONSTRAINT `organization_structure_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin COMMENT = '组织架构表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of organization_structure
-- ----------------------------
INSERT INTO `organization_structure` VALUES (1, '董事会', '公司最高决策机构', NULL, 5, 1, 'crown', 'high', '2026-03-20 16:36:49', '2026-03-20 16:47:57');
INSERT INTO `organization_structure` VALUES (2, '技术研发部', '负责公司技术研发工作', 1, 5, 2, 'laptop-code', 'core', '2026-03-20 16:36:49', '2026-03-20 16:47:57');
INSERT INTO `organization_structure` VALUES (3, '产品规划部', '负责产品规划和设计', 1, 5, 2, 'project-diagram', 'key', '2026-03-20 16:36:49', '2026-03-20 16:47:57');
INSERT INTO `organization_structure` VALUES (4, '市场营销部', '负责市场推广和销售', 1, 5, 2, 'chart-line', 'business', '2026-03-20 16:36:49', '2026-03-20 16:47:57');
INSERT INTO `organization_structure` VALUES (5, '前端开发组', '负责前端开发工作', 2, 5, 3, 'code', 'normal', '2026-03-20 16:36:49', '2026-03-20 16:47:57');
INSERT INTO `organization_structure` VALUES (6, '后端开发组', '负责后端开发工作', 2, 5, 3, 'server', 'normal', '2026-03-20 16:36:49', '2026-03-20 16:47:57');
INSERT INTO `organization_structure` VALUES (7, 'AI研究组', '负责人工智能研究', 2, 5, 3, 'brain', 'normal', '2026-03-20 16:36:49', '2026-03-20 16:47:57');
INSERT INTO `organization_structure` VALUES (8, '产品设计组', '负责产品设计工作', 3, 5, 3, 'palette', 'normal', '2026-03-20 16:36:49', '2026-03-20 16:47:57');
INSERT INTO `organization_structure` VALUES (9, '市场推广组', '负责市场推广活动', 4, 5, 3, 'bullhorn', 'normal', '2026-03-20 16:36:49', '2026-03-20 16:47:57');
INSERT INTO `organization_structure` VALUES (10, '销售团队', '负责产品销售工作', 4, 5, 3, 'shopping-cart', 'normal', '2026-03-20 16:36:49', '2026-03-20 16:47:57');

-- ----------------------------
-- Table structure for path_courses
-- ----------------------------
DROP TABLE IF EXISTS `path_courses`;
CREATE TABLE `path_courses`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `path_id` int NOT NULL,
  `course_id` int NOT NULL,
  `order_number` int NOT NULL COMMENT '课程顺序',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_path_course`(`path_id` ASC, `course_id` ASC) USING BTREE,
  INDEX `path_id`(`path_id` ASC) USING BTREE,
  INDEX `course_id`(`course_id` ASC) USING BTREE,
  CONSTRAINT `path_courses_ibfk_1` FOREIGN KEY (`path_id`) REFERENCES `learning_paths` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `path_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of path_courses
-- ----------------------------
INSERT INTO `path_courses` VALUES (1, 1, 1, 1);
INSERT INTO `path_courses` VALUES (2, 2, 2, 1);

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `module_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uniq_permission_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of permissions
-- ----------------------------
INSERT INTO `permissions` VALUES (5, 1, '2级管理员权限', '负责资料、公告、会议报告等内容的审查和管理\n用户注册审核权限\n');
INSERT INTO `permissions` VALUES (6, 1, '3级管理员权限', '负责资料、公告、会议报告等内容的审查和管理\n用户注册审核权限\n普通用户管理权限');
INSERT INTO `permissions` VALUES (9, 1, '4级管理员权限', '负责资料、公告、会议报告等内容的审查和管理\n用户注册审核权限\n普通用户管理权限\n管理员的管理权限');
INSERT INTO `permissions` VALUES (10, 1, '5级管理员权限', '拥护所有系统权限，且不受其他管理的操作影响');
INSERT INTO `permissions` VALUES (12, 1, '临时游客权限', '仅允许浏览内容，且无法查看1级成员内容');

-- ----------------------------
-- Table structure for projects
-- ----------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `type` enum('research','product','market') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `creator_id` int NOT NULL,
  `status` enum('planning','in_progress','completed','archived') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'planning',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `creator_id`(`creator_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of projects
-- ----------------------------

-- ----------------------------
-- Table structure for report
-- ----------------------------
DROP TABLE IF EXISTS `report`;
CREATE TABLE `report`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `author` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `submit_time` datetime NULL DEFAULT NULL,
  `status` int NULL DEFAULT NULL,
  `review_comment` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `start_date` date NULL DEFAULT NULL,
  `end_date` date NULL DEFAULT NULL,
  `creator_id` bigint NULL DEFAULT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of report
-- ----------------------------

-- ----------------------------
-- Table structure for schedules
-- ----------------------------
DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `all_day` tinyint(1) NULL DEFAULT 0,
  `type` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT 'meeting',
  `location` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `user_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_start_time`(`start_time` ASC) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 41 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of schedules
-- ----------------------------
INSERT INTO `schedules` VALUES (1, '全国大学生程序设计竞赛准备', '2025-10-03 09:00:00', '2025-10-03 12:00:00', 0, 'project', '计算机实验室', '准备ACM竞赛算法题训练', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (2, '数学建模竞赛小组讨论', '2025-10-05 14:00:00', '2025-10-05 16:30:00', 0, 'meeting', '数学系会议室', '讨论建模题目和分工', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (3, '机器人竞赛机械设计', '2025-10-08 10:00:00', '2025-10-08 12:00:00', 0, 'project', '工程训练中心', '机器人机械结构设计与调试', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (4, '电子设计竞赛元件采购', '2025-10-10 13:00:00', '2025-10-10 15:00:00', 0, 'task', '电子市场', '购买竞赛所需电子元件', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (5, '创新创业大赛计划书撰写', '2025-10-12 09:00:00', '2025-10-12 17:00:00', 1, 'project', '图书馆', '全天撰写创新创业大赛计划书', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (6, '英语演讲比赛练习', '2025-10-15 15:00:00', '2025-10-15 17:00:00', 0, 'personal', '外语学院', '英语演讲比赛赛前练习', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (7, '数据结构竞赛培训', '2025-10-18 14:00:00', '2025-10-18 16:00:00', 0, 'meeting', '计算机学院102', '参加数据结构竞赛培训', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (8, '人工智能挑战赛代码调试', '2025-10-20 10:00:00', '2025-10-20 12:00:00', 0, 'task', '人工智能实验室', '调试AI挑战赛代码', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (9, '网络安全竞赛准备', '2025-10-23 13:00:00', '2025-10-23 15:00:00', 0, 'project', '网络安全实验室', '准备CTF竞赛题目', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (10, '机器人竞赛程序编写', '2025-10-25 09:00:00', '2025-10-25 11:30:00', 0, 'task', '机器人实验室', '编写机器人控制程序', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (11, '数学竞赛模拟测试', '2025-10-27 14:00:00', '2025-10-27 16:30:00', 0, 'personal', '数学系教室', '参加数学竞赛模拟测试', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (12, '电子设计竞赛电路调试', '2025-10-29 10:00:00', '2025-10-29 12:00:00', 0, 'task', '电子实验室', '调试电子设计竞赛电路', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (13, '毕业论文开题讨论', '2025-11-02 09:00:00', '2025-11-02 11:00:00', 0, 'meeting', '导师办公室', '与导师讨论毕业论文开题', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (14, '机器学习论文阅读小组', '2025-11-05 14:00:00', '2025-11-05 16:00:00', 0, 'meeting', '图书馆研讨室', '小组讨论最新机器学习论文', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (15, '高等数学复习', '2025-11-07 19:00:00', '2025-11-07 21:00:00', 0, 'personal', '自习室', '复习高等数学期中考试', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (16, '学术论文数据处理', '2025-11-09 09:00:00', '2025-11-09 12:00:00', 0, 'task', '计算机房', '处理学术论文所需数据', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (17, '文献检索方法讲座', '2025-11-12 14:00:00', '2025-11-12 16:00:00', 0, 'meeting', '图书馆报告厅', '参加文献检索方法讲座', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (18, '程序设计课程项目', '2025-11-14 10:00:00', '2025-11-14 12:00:00', 0, 'project', '计算机实验室', '完成程序设计课程项目', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (19, '学术英语写作练习', '2025-11-16 15:00:00', '2025-11-16 17:00:00', 0, 'personal', '外语学院', '练习学术英语写作', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (20, '论文图表制作', '2025-11-19 09:00:00', '2025-11-19 11:00:00', 0, 'task', '设计室', '制作论文中的图表', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (21, '学术会议准备', '2025-11-21 14:00:00', '2025-11-21 16:00:00', 0, 'project', '会议室', '准备学术会议演讲材料', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (22, '期末考试复习', '2025-11-23 19:00:00', '2025-11-23 21:30:00', 0, 'personal', '图书馆', '复习期末考试内容', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (23, '论文参考文献整理', '2025-11-26 10:00:00', '2025-11-26 12:00:00', 0, 'task', '自习室', '整理论文参考文献', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (24, '学术报告排练', '2025-11-28 15:00:00', '2025-11-28 17:00:00', 0, 'personal', '空教室', '排练学术报告内容', 53, '2025-09-20 09:47:27', '2025-10-11 19:16:04');
INSERT INTO `schedules` VALUES (25, '技术交流会', '2025-09-02 14:00:00', '2025-09-02 16:30:00', 0, 'meeting', '学生活动中心', '参加校园技术交流会', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (26, '团队建设活动', '2025-09-04 09:00:00', '2025-09-04 17:00:00', 1, 'personal', '郊野公园', '全班团队建设日活动', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (27, '学术沙龙', '2025-09-06 19:00:00', '2025-09-06 21:00:00', 0, 'meeting', '咖啡厅', '参加学术沙龙交流活动', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (28, '迎新晚会排练', '2025-09-09 18:00:00', '2025-09-09 20:00:00', 0, 'personal', '礼堂', '参加迎新晚会节目排练', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (29, '职业规划讲座', '2025-09-11 14:00:00', '2025-09-11 16:00:00', 0, 'meeting', '就业指导中心', '参加职业规划讲座', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (30, '班级聚餐', '2025-09-13 18:00:00', '2025-09-13 20:30:00', 0, 'personal', '学校餐厅', '班级学期初聚餐', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (31, '社团招新活动', '2025-09-16 10:00:00', '2025-09-16 15:00:00', 1, 'meeting', '校园广场', '参与科技社团招新活动', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (32, '电影之夜', '2025-09-18 19:00:00', '2025-09-18 22:00:00', 0, 'personal', '学生活动中心', '参加社团组织的电影之夜', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (33, '学术成果展示会', '2025-09-20 09:00:00', '2025-09-20 12:00:00', 0, 'meeting', '展览厅', '参观学术成果展示会', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (34, '运动会训练', '2025-09-23 16:00:00', '2025-09-23 18:00:00', 0, 'personal', '操场', '参加运动会赛前训练', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (35, '技术工作坊', '2025-09-25 14:00:00', '2025-09-25 17:00:00', 0, 'meeting', '创新工场', '参加Arduino技术工作坊', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (36, '校园歌手大赛', '2025-09-27 19:00:00', '2025-09-27 22:00:00', 0, 'personal', '大礼堂', '观看校园歌手大赛决赛', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (37, '读书分享会', '2025-09-29 15:00:00', '2025-09-29 17:00:00', 0, 'meeting', '图书馆', '参加科技类图书分享会', 53, '2025-09-20 09:47:27', '2025-09-20 09:47:27');
INSERT INTO `schedules` VALUES (40, '计算机博弈校赛', '2026-04-01 00:00:00', '2026-04-05 23:59:59', 1, 'meeting', '无', '无', 53, '2026-03-30 13:52:08', '2026-03-30 13:52:08');

-- ----------------------------
-- Table structure for spring_session
-- ----------------------------
DROP TABLE IF EXISTS `spring_session`;
CREATE TABLE `spring_session`  (
  `PRIMARY_ID` char(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `SESSION_ID` char(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `CREATION_TIME` bigint NOT NULL,
  `LAST_ACCESS_TIME` bigint NOT NULL,
  `MAX_INACTIVE_INTERVAL` int NOT NULL,
  `EXPIRY_TIME` bigint NOT NULL,
  `PRINCIPAL_NAME` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  PRIMARY KEY (`PRIMARY_ID`) USING BTREE,
  UNIQUE INDEX `SPRING_SESSION_IX1`(`SESSION_ID` ASC) USING BTREE,
  INDEX `SPRING_SESSION_IX2`(`EXPIRY_TIME` ASC) USING BTREE,
  INDEX `SPRING_SESSION_IX3`(`PRINCIPAL_NAME` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of spring_session
-- ----------------------------
INSERT INTO `spring_session` VALUES ('e7907c68-6fc9-41ec-8b58-f437cf97b275', 'ac5ce07f-63bd-4282-ae3f-46dc3dce9f90', 1774850250138, 1774850360068, 3600, 1774853960068, NULL);

-- ----------------------------
-- Table structure for spring_session_attributes
-- ----------------------------
DROP TABLE IF EXISTS `spring_session_attributes`;
CREATE TABLE `spring_session_attributes`  (
  `SESSION_PRIMARY_ID` char(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ATTRIBUTE_NAME` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ATTRIBUTE_BYTES` blob NOT NULL,
  PRIMARY KEY (`SESSION_PRIMARY_ID`, `ATTRIBUTE_NAME`) USING BTREE,
  CONSTRAINT `SPRING_SESSION_ATTRIBUTES_FK` FOREIGN KEY (`SESSION_PRIMARY_ID`) REFERENCES `spring_session` (`PRIMARY_ID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of spring_session_attributes
-- ----------------------------
INSERT INTO `spring_session_attributes` VALUES ('e7907c68-6fc9-41ec-8b58-f437cf97b275', 'user', 0xACED00057372001B636F6D2E6578616D706C652E64656D6F2E6D6F64656C2E55736572000000000000000102000D4C000A61646D696E4C6576656C7400134C6A6176612F6C616E672F496E74656765723B4C00066176617461727400124C6A6176612F6C616E672F537472696E673B4C000B636F6E74616374496E666F71007E00024C0005656D61696C71007E00024C000269647400104C6A6176612F6C616E672F4C6F6E673B4C000870617373776F726471007E00024C0008706F736974696F6E71007E00024C0010726567697374726174696F6E4461746571007E00024C0004726F6C6571007E00024C000673656372657471007E00024C000673746174757371007E00014C0009757365724C6576656C71007E00014C0008757365726E616D6571007E00027870707074000B3139373230313837383738740011333031303138303637354071712E636F6D7372000E6A6176612E6C616E672E4C6F6E673B8BE490CC8F23DF0200014A000576616C7565787200106A6176612E6C616E672E4E756D62657286AC951D0B94E08B0200007870000000000000003570740009E891A3E4BA8BE995BF740013323032352D30382D30352032323A35323A353674000561646D696E7400037A7774737200116A6176612E6C616E672E496E746567657212E2A0A4F781873802000149000576616C75657871007E0008000000017371007E000E0000000F740009E69BBEE69687E6B69B);

-- ----------------------------
-- Table structure for task
-- ----------------------------
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL COMMENT '任务标题',
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL COMMENT '任务描述',
  `assignee_id` bigint NOT NULL COMMENT '负责人ID（外键关联用户表）',
  `priority` tinyint NULL DEFAULT 2 COMMENT '优先级（1-低，2-中，3-高）',
  `status` tinyint NULL DEFAULT 0 COMMENT '状态（0-待审核，1-已通过，2-已拒绝，3-进行中，4-已完成）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `start_time` datetime NULL DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `reviewer_id` bigint NULL DEFAULT NULL COMMENT '审核人ID（外键关联用户表，管理员）',
  `reviewer_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `review_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `review_comment` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL COMMENT '审核意见',
  `attachment_url` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '附件URL',
  `progress` tinyint NULL DEFAULT 0 COMMENT '进度（0-100）',
  `is_deleted` tinyint NULL DEFAULT 0 COMMENT '是否删除（0-否，1-是）',
  `creator_id` bigint NOT NULL,
  `creator_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `material_id` bigint NULL DEFAULT NULL,
  `reward` int NULL DEFAULT 10,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_assignee`(`assignee_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_priority`(`priority` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 121 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin COMMENT = '任务表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of task
-- ----------------------------
INSERT INTO `task` VALUES (65, '全国编程大赛汇报', '整理全国大学生编程竞赛获奖项目资料', 53, 3, 4, '2025-09-13 15:15:21', '2025-09-20 15:15:21', '2025-09-14 15:15:21', '2025-09-19 15:15:21', NULL, NULL, '2025-09-15 15:15:21', NULL, 'https://example.com/docs/contest.pdf', 100, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (66, '移动应用开发经验分享', '为低年级同学分享iOS开发实战经验', 53, 2, 3, '2025-09-15 15:15:21', '2025-09-20 15:15:21', '2025-09-17 15:15:21', NULL, NULL, NULL, '2025-09-16 15:15:21', NULL, NULL, 80, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (67, '校园代取快递服务', '帮助同学代取韵达快递点包裹', 53, 1, 1, '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (68, '网站性能优化项目', '对学校官网进行加载速度优化', 53, 3, 3, '2025-09-10 15:15:21', '2025-09-20 15:15:21', '2025-09-12 15:15:21', NULL, NULL, NULL, '2025-09-11 15:15:21', NULL, 'https://example.com/docs/optimization.pdf', 85, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (69, '机器学习竞赛冲刺', '准备国际机器学习竞赛最终阶段', 53, 3, 2, '2025-09-17 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, '2025-09-18 15:15:21', NULL, NULL, 60, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (70, '等级试炼-分布式系统', '通过构建高可用分布式系统提升等级', 53, 3, 1, '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (71, '课程设计作品完善', '完成操作系统课程设计项目', 53, 2, 3, '2025-09-16 15:15:21', '2025-09-20 15:15:21', '2025-09-17 15:15:21', NULL, NULL, NULL, '2025-09-17 15:15:21', NULL, NULL, 70, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (72, '学术论文代查服务', '帮助同学检索IEEE学术论文', 53, 1, 4, '2025-09-18 15:15:21', '2025-09-20 15:15:21', '2025-09-19 15:15:21', '2025-09-20 15:15:21', NULL, NULL, '2025-09-19 15:15:21', NULL, NULL, 100, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (73, '创新创业计划书', '撰写大学生创新创业训练计划项目书', 53, 2, 3, '2025-09-12 15:15:21', '2025-09-20 15:15:21', '2025-09-14 15:15:21', NULL, NULL, NULL, '2025-09-13 15:15:21', NULL, 'https://example.com/docs/innovation.pdf', 90, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (74, '安卓应用UI重构', '优化学生社团安卓应用的界面设计', 53, 2, 2, '2025-09-14 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, '2025-09-15 15:15:21', NULL, NULL, 50, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (75, '等级试炼-算法挑战', '解决LeetCode Hard级别算法题20道', 53, 3, 1, '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (76, '竞赛答辩PPT制作', '制作数学建模竞赛答辩演示文稿', 53, 3, 3, '2025-09-15 15:15:21', '2025-09-20 15:15:21', '2025-09-16 15:15:21', NULL, NULL, NULL, '2025-09-16 15:15:21', NULL, NULL, 70, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (77, '留学生代购服务', '帮助留学生代购中国特色食品', 53, 1, 4, '2025-09-17 15:15:21', '2025-09-20 15:15:21', '2025-09-18 15:15:21', '2025-09-20 15:15:21', NULL, NULL, '2025-09-18 15:15:21', NULL, NULL, 100, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (78, 'Web前端项目开发', '开发校园活动报名前端页面', 53, 2, 3, '2025-09-08 15:15:21', '2025-09-20 15:15:21', '2025-09-10 15:15:21', NULL, NULL, NULL, '2025-09-09 15:15:21', NULL, NULL, 85, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (79, '学术分享会筹备', '组织高年级学术经验分享会', 53, 2, 2, '2025-09-13 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, '2025-09-14 15:15:21', NULL, NULL, 45, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (80, '等级试炼-安全攻防', '通过CTF竞赛提升安全技术等级', 53, 3, 1, '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (81, '课程作业代交', '帮助请假同学提交物理实验报告', 53, 1, 4, '2025-09-19 15:15:21', '2025-09-20 15:15:21', '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, '2025-09-20 15:15:21', NULL, NULL, 100, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (82, '深度学习项目优化', '优化图像识别模型的准确率', 53, 3, 3, '2025-09-11 15:15:21', '2025-09-20 15:15:21', '2025-09-13 15:15:21', NULL, NULL, NULL, '2025-09-12 15:15:21', NULL, NULL, 65, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (83, '学生会工作报告', '撰写学生会年度工作总结汇报', 53, 2, 3, '2025-09-05 15:15:21', '2025-09-20 15:15:21', '2025-09-08 15:15:21', NULL, NULL, NULL, '2025-09-07 15:15:21', NULL, 'https://example.com/docs/report.pdf', 95, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (84, '移动应用发布准备', '准备社交APP应用商店发布材料', 53, 3, 2, '2025-09-12 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, '2025-09-13 15:15:21', NULL, NULL, 75, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (85, '等级试炼-数据库设计', '设计并实现高并发数据库系统', 53, 3, 1, '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (86, '竞赛团队招募', '招募机器人竞赛团队成员', 53, 2, 2, '2025-09-14 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, '2025-09-15 15:15:21', NULL, NULL, 35, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (87, '校外材料代取', '前往市区代取重要申请材料', 53, 2, 4, '2025-09-18 15:15:21', '2025-09-20 15:15:21', '2025-09-19 15:15:21', '2025-09-20 15:15:21', NULL, NULL, '2025-09-19 15:15:21', NULL, NULL, 100, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (88, '毕业设计项目开发', '开始进行毕业设计项目实施', 53, 3, 3, '2025-08-31 15:15:21', '2025-09-20 15:15:21', '2025-09-02 15:15:21', NULL, NULL, NULL, '2025-09-01 15:15:21', NULL, NULL, 55, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (89, '学术论文汇报', '准备国际会议论文汇报演示', 53, 3, 3, '2025-09-10 15:15:21', '2025-09-20 15:15:21', '2025-09-12 15:15:21', NULL, NULL, NULL, '2025-09-11 15:15:21', NULL, 'https://example.com/docs/paper.pdf', 85, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (90, '校园导航APP优化', '优化校园导航APP的路径算法', 53, 2, 3, '2025-09-06 15:15:21', '2025-09-20 15:15:21', '2025-09-08 15:15:21', NULL, NULL, NULL, '2025-09-07 15:15:21', NULL, NULL, 60, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (91, '等级试炼-系统架构', '设计微服务架构并通过压力测试', 53, 3, 1, '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (92, '竞赛获奖心得分享', '准备竞赛获奖经验分享会内容', 53, 2, 2, '2025-09-13 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, '2025-09-14 15:15:21', NULL, NULL, 40, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (93, '代购专业书籍', '帮助同学代购国外专业教材', 53, 1, 4, '2025-09-16 15:15:21', '2025-09-20 15:15:21', '2025-09-17 15:15:21', '2025-09-20 15:15:21', NULL, NULL, '2025-09-17 15:15:21', NULL, NULL, 100, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (94, '实验室网站重建', '重新设计实验室官方网站', 53, 2, 3, '2025-08-26 15:15:21', '2025-09-20 15:15:21', '2025-08-29 15:15:21', NULL, NULL, NULL, '2025-08-28 15:15:21', NULL, NULL, 90, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (95, '保研经验分享会', '为低年级同学分享保研经验', 53, 2, 2, '2025-09-11 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, '2025-09-12 15:15:21', NULL, NULL, 50, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (96, '等级试炼-性能优化', '将系统性能优化至毫秒级响应', 53, 3, 1, '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (97, '课程项目演示', '准备软件工程课程项目演示', 53, 2, 3, '2025-09-08 15:15:21', '2025-09-20 15:15:21', '2025-09-10 15:15:21', NULL, NULL, NULL, '2025-09-09 15:15:21', NULL, 'https://example.com/docs/demo.pdf', 80, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (98, '校外比赛材料递交', '代递交创新竞赛报名材料', 53, 2, 4, '2025-09-17 15:15:21', '2025-09-20 15:15:21', '2025-09-18 15:15:21', '2025-09-20 15:15:21', NULL, NULL, '2025-09-18 15:15:21', NULL, NULL, 100, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (99, '智能硬件项目开发', '开发物联网智能硬件设备', 53, 3, 3, '2025-09-02 15:15:21', '2025-09-20 15:15:21', '2025-09-04 15:15:21', NULL, NULL, NULL, '2025-09-03 15:15:21', NULL, NULL, 70, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (100, '学术竞赛指导', '指导低年级同学参加学术竞赛', 53, 2, 2, '2025-09-12 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, '2025-09-13 15:15:21', NULL, NULL, 45, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (101, '等级试炼-全栈开发', '独立开发完整全栈应用并通过测试', 53, 3, 1, '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (102, '学生会工作汇报', '准备学生会部门工作汇报', 53, 2, 3, '2025-09-05 15:15:21', '2025-09-20 15:15:21', '2025-09-07 15:15:21', NULL, NULL, NULL, '2025-09-06 15:15:21', NULL, 'https://example.com/docs/work.pdf', 85, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (103, '代购实验器材', '帮助实验室代购专用器材', 53, 2, 4, '2025-09-15 15:15:21', '2025-09-20 15:15:21', '2025-09-16 15:15:21', '2025-09-20 15:15:21', NULL, NULL, '2025-09-16 15:15:21', NULL, NULL, 100, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (104, '微信小程序开发', '开发校园失物招领小程序', 53, 2, 3, '2025-09-04 15:15:21', '2025-09-20 15:15:21', '2025-09-06 15:15:21', NULL, NULL, NULL, '2025-09-05 15:15:21', NULL, NULL, 65, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (105, '考研经验分享', '分享考研复习方法与经验', 53, 2, 2, '2025-09-10 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, '2025-09-11 15:15:21', NULL, NULL, 55, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (106, '等级试炼-大数据处理', '处理TB级数据并完成分析报告', 53, 3, 1, '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (107, '课程作品展示', '准备数字媒体课程作品展示', 53, 2, 3, '2025-09-07 15:15:21', '2025-09-20 15:15:21', '2025-09-09 15:15:21', NULL, NULL, NULL, '2025-09-08 15:15:21', NULL, 'https://example.com/docs/showcase.pdf', 75, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (108, '紧急文件代交', '代交紧急申请材料至教务处', 53, 3, 4, '2025-09-19 15:15:21', '2025-09-20 15:15:21', '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, '2025-09-20 15:15:21', NULL, NULL, 100, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (109, '虚拟现实项目开发', '开发教育用VR体验项目', 53, 3, 3, '2025-08-29 15:15:21', '2025-09-20 15:15:21', '2025-08-31 15:15:21', NULL, NULL, NULL, '2025-08-30 15:15:21', NULL, NULL, 50, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (110, '国际竞赛汇报', '准备国际竞赛获奖项目汇报', 53, 3, 3, '2025-09-03 15:15:21', '2025-09-20 15:15:21', '2025-09-05 15:15:21', NULL, NULL, NULL, '2025-09-04 15:15:21', NULL, 'https://example.com/docs/international.pdf', 90, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (111, '等级试炼-人工智能', '实现并训练深度学习模型', 53, 3, 1, '2025-09-20 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (112, '学生社团招新APP', '开发社团招新移动应用', 53, 2, 3, '2025-09-01 15:15:21', '2025-09-20 15:15:21', '2025-09-03 15:15:21', NULL, NULL, NULL, '2025-09-02 15:15:21', NULL, NULL, 60, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (113, '学习方法分享', '分享高效学习方法与技巧', 53, 2, 2, '2025-09-09 15:15:21', '2025-09-20 15:15:21', NULL, NULL, NULL, NULL, '2025-09-10 15:15:21', NULL, NULL, 40, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (114, '校外实践报告', '撰写企业实践总结报告', 53, 2, 3, '2025-09-06 15:15:21', '2025-09-20 15:15:21', '2025-09-08 15:15:21', NULL, NULL, NULL, '2025-09-07 15:15:21', NULL, 'https://example.com/docs/practice.pdf', 85, 0, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (118, '外卖配送服务', '1', 96, 2, 1, '2026-03-23 18:40:28', '2026-03-30 13:28:38', NULL, NULL, 1, NULL, '2026-03-30 13:28:38', '无问题', NULL, 0, 0, 96, '西兰花', NULL, 1);
INSERT INTO `task` VALUES (119, '1', '1', 53, 3, 0, '2026-03-30 13:34:24', '2026-03-30 13:34:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 53, '曾文涛', NULL, 10);
INSERT INTO `task` VALUES (120, '1', '1', 53, 3, 0, '2026-03-30 13:34:40', '2026-03-30 13:34:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 53, '曾文涛', 16, 10);

-- ----------------------------
-- Table structure for task_tag
-- ----------------------------
DROP TABLE IF EXISTS `task_tag`;
CREATE TABLE `task_tag`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `task_id` bigint NOT NULL,
  `task_tag_stats_id` bigint NOT NULL,
  `created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_task_tag_task_id`(`task_id` ASC) USING BTREE,
  INDEX `idx_task_tag_name`(`task_tag_stats_id` ASC) USING BTREE,
  CONSTRAINT `task_tag_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `task` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 81 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of task_tag
-- ----------------------------
INSERT INTO `task_tag` VALUES (1, 65, 1, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (2, 65, 2, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (3, 66, 4, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (4, 66, 3, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (5, 66, 17, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (6, 67, 5, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (7, 67, 29, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (8, 68, 7, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (9, 68, 8, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (10, 68, 18, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (11, 69, 1, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (12, 69, 9, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (13, 69, 27, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (14, 70, 10, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (15, 70, 35, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (16, 71, 13, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (17, 71, 12, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (18, 71, 18, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (19, 72, 14, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (20, 72, 3, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (21, 73, 16, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (22, 73, 15, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (23, 73, 18, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (24, 74, 17, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (25, 74, 4, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (26, 74, 8, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (27, 75, 10, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (28, 75, 9, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (29, 75, 11, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (30, 76, 1, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (31, 76, 2, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (32, 76, 21, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (33, 77, 6, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (34, 77, 29, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (35, 78, 7, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (36, 78, 18, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (37, 79, 14, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (38, 79, 3, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (39, 79, 21, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (40, 80, 10, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (41, 80, 30, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (42, 80, 11, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (43, 81, 13, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (44, 81, 23, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (45, 81, 21, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (46, 82, 27, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (47, 82, 18, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (48, 82, 8, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (49, 83, 2, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (50, 83, 21, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (51, 84, 17, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (52, 84, 4, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (53, 84, 21, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (54, 85, 10, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (55, 85, 33, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (56, 86, 1, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (57, 86, 34, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (58, 86, 21, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (59, 87, 5, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (60, 87, 31, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (61, 88, 32, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (62, 88, 18, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (63, 88, 16, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (64, 89, 14, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (65, 89, 2, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (66, 90, 17, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (67, 90, 4, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (68, 90, 8, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (69, 91, 10, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (70, 91, 35, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (71, 91, 11, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (72, 92, 1, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (73, 92, 3, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (74, 92, 2, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (75, 93, 6, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (76, 93, 23, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (77, 94, 7, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (78, 94, 18, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (79, 94, 22, '2025-09-22 13:00:00');
INSERT INTO `task_tag` VALUES (80, 95, 3, '2025-09-22 13:00:00');

-- ----------------------------
-- Table structure for task_tag_stats
-- ----------------------------
DROP TABLE IF EXISTS `task_tag_stats`;
CREATE TABLE `task_tag_stats`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `visit_count` int NULL DEFAULT 0,
  `last_visited` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_tag_name`(`tag_name` ASC) USING BTREE,
  INDEX `idx_visit_count`(`visit_count` DESC) USING BTREE,
  INDEX `idx_last_visited`(`last_visited` DESC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of task_tag_stats
-- ----------------------------
INSERT INTO `task_tag_stats` VALUES (1, '竞赛', 8, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (2, '汇报', 7, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (3, '分享', 8, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (4, '移动端', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (5, '跑腿', 6, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (6, '代购', 5, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (7, '网站', 3, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (8, '优化', 5, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (9, '算法', 2, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (10, '等级试炼', 9, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (11, '高难度', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (12, '作品', 2, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (13, '课程', 3, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (14, '学术', 4, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (15, '培养计划', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (16, '创新', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (17, 'APP', 5, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (18, '项目', 12, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (19, '硬件', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (20, '全栈', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (21, '工作', 2, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (22, '实验', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (23, '学习', 4, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (24, '大数据', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (25, '紧急', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (26, 'VR', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (27, 'AI', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (28, '实践', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (29, '生活', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (30, '安全', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (31, '重要', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (32, '毕业', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (33, '数据库', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (34, '团队', 1, '2025-09-20 17:00:00');
INSERT INTO `task_tag_stats` VALUES (35, '架构', 1, '2025-09-20 17:00:00');

-- ----------------------------
-- Table structure for team_activities
-- ----------------------------
DROP TABLE IF EXISTS `team_activities`;
CREATE TABLE `team_activities`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `team_id` bigint NOT NULL COMMENT '团队ID',
  `type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL COMMENT '动态类型：promotion, cooperation, project, innovation, join, leave, etc.',
  `title` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL COMMENT '动态标题',
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL COMMENT '动态描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建人ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_team_id`(`team_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `team_activities_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin COMMENT = '团队动态表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of team_activities
-- ----------------------------
INSERT INTO `team_activities` VALUES (1, 5, 'promotion', '职级晋升', '曾文涛成功晋升至第十职级，获得高级管理权限', '2026-03-20 16:47:57', 14);
INSERT INTO `team_activities` VALUES (2, 5, 'cooperation', '合作协议', '与创新科技公司达成战略合作协议', '2026-03-20 16:47:57', 15);
INSERT INTO `team_activities` VALUES (3, 5, 'project', '项目完成', '前端开发组成功完成\"智能平台\"项目开发', '2026-03-20 16:47:57', 14);
INSERT INTO `team_activities` VALUES (4, 5, 'innovation', '创新发现', 'AI研究组发现新的技术解决方案\"智能优化算法\"', '2026-03-20 16:47:57', 16);

-- ----------------------------
-- Table structure for team_details
-- ----------------------------
DROP TABLE IF EXISTS `team_details`;
CREATE TABLE `team_details`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `team_id` bigint NOT NULL,
  `establish_date` date NULL DEFAULT NULL COMMENT '成立日期',
  `goal` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '团队目标',
  `location` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '团队位置',
  `tags` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '团队标签',
  `member_count` int NULL DEFAULT 0 COMMENT '成员数量',
  `activity_rate` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '活跃度',
  `type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'department' COMMENT '团队类型：department(部门), project(项目组), taskforce(特别任务组), committee(委员会)',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_team`(`team_id` ASC) USING BTREE,
  CONSTRAINT `team_details_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin COMMENT = '团队明细表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of team_details
-- ----------------------------
INSERT INTO `team_details` VALUES (1, 5, '2025-01-01', '打造行业领先的团队协作平台', '北京市海淀区', '管理,决策,核心', 3, 98.50, 'committee', '2026-03-24 18:15:18');

-- ----------------------------
-- Table structure for team_members
-- ----------------------------
DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `team_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `role` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_team_user`(`team_id` ASC, `user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of team_members
-- ----------------------------
INSERT INTO `team_members` VALUES (14, 5, 53, 'admin', '2025-09-13 12:54:19');
INSERT INTO `team_members` VALUES (15, 5, 91, 'member', '2025-09-13 12:54:19');
INSERT INTO `team_members` VALUES (16, 5, 92, 'member', '2025-09-13 12:54:19');
INSERT INTO `team_members` VALUES (17, 5, 96, 'member', '2026-03-22 14:51:16');

-- ----------------------------
-- Table structure for team_points
-- ----------------------------
DROP TABLE IF EXISTS `team_points`;
CREATE TABLE `team_points`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `team_id` bigint NOT NULL,
  `points` int NULL DEFAULT 0 COMMENT '积分值',
  `today_points` int NULL DEFAULT 0 COMMENT '今日积分',
  `total_points` bigint NULL DEFAULT 0 COMMENT '总积分',
  `ranking` int NULL DEFAULT 0 COMMENT '排名',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_team_points_team_id`(`team_id` ASC) USING BTREE,
  INDEX `idx_team_points_ranking`(`ranking` ASC) USING BTREE,
  INDEX `idx_team_points_total_points`(`total_points` DESC) USING BTREE,
  CONSTRAINT `team_points_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of team_points
-- ----------------------------
INSERT INTO `team_points` VALUES (1, 5, 5000, 500, 50000, 1, '2026-03-19 14:39:51');

-- ----------------------------
-- Table structure for team_settings
-- ----------------------------
DROP TABLE IF EXISTS `team_settings`;
CREATE TABLE `team_settings`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `team_id` bigint NOT NULL,
  `join_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'approval',
  `visibility` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'public',
  `join_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `level_limit` int NULL DEFAULT 0,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_team`(`team_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of team_settings
-- ----------------------------
INSERT INTO `team_settings` VALUES (1, 5, 'open', 'public', '123456', 10, '2026-03-25 19:09:26');

-- ----------------------------
-- Table structure for teams
-- ----------------------------
DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `organizer_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `join_method` enum('open','approval','invite') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'approval' COMMENT '加入方式',
  `visibility` enum('public','private') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'public' COMMENT '团队可见性',
  `establish_date` date NULL DEFAULT NULL COMMENT '成立日期',
  `goal` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '团队目标',
  `location` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '团队位置',
  `level` int NULL DEFAULT 1 COMMENT '团队等级',
  `activity_rate` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '活跃度',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of teams
-- ----------------------------
INSERT INTO `teams` VALUES (5, '董事会', '公司最高决策团队，没有之一！\n', 53, '2025-09-13 12:54:19', '2026-03-25 19:09:26', 'approval', 'public', NULL, NULL, NULL, 1, 0.00);

-- ----------------------------
-- Table structure for user_announcement_status
-- ----------------------------
DROP TABLE IF EXISTS `user_announcement_status`;
CREATE TABLE `user_announcement_status`  (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `announcement_id` bigint NOT NULL,
  `is_read` tinyint NULL DEFAULT 0,
  `is_closed` tinyint NULL DEFAULT 0,
  `last_viewed` datetime NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `20`(`user_id` ASC) USING BTREE,
  INDEX `23`(`announcement_id` ASC) USING BTREE,
  CONSTRAINT `20` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `23` FOREIGN KEY (`announcement_id`) REFERENCES `announcement` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_announcement_status
-- ----------------------------

-- ----------------------------
-- Table structure for user_badges
-- ----------------------------
DROP TABLE IF EXISTS `user_badges`;
CREATE TABLE `user_badges`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `badge_name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `badge_icon` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `earned_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_badges
-- ----------------------------
INSERT INTO `user_badges` VALUES (1, 53, '初学者', 'fas fa-star', '2025-08-15 00:00:00');
INSERT INTO `user_badges` VALUES (2, 53, '数据库达人', 'fas fa-database', '2025-08-30 00:00:00');
INSERT INTO `user_badges` VALUES (3, 53, 'React 爱好者', 'fab fa-react', '2025-09-10 00:00:00');
INSERT INTO `user_badges` VALUES (4, 53, '学习先锋', 'fas fa-trophy', '2025-09-15 00:00:00');
INSERT INTO `user_badges` VALUES (5, 53, '评论达人', 'fas fa-comment', '2025-09-17 00:00:00');
INSERT INTO `user_badges` VALUES (6, 53, '连续学习7天', 'fas fa-calendar-check', '2025-09-17 00:00:00');
INSERT INTO `user_badges` VALUES (7, 53, '课程完成者', 'fas fa-check-circle', '2025-08-30 00:00:00');
INSERT INTO `user_badges` VALUES (8, 53, '学习时长达人', 'fas fa-clock', '2025-09-17 00:00:00');

-- ----------------------------
-- Table structure for user_devices
-- ----------------------------
DROP TABLE IF EXISTS `user_devices`;
CREATE TABLE `user_devices`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `device_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `device_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `browser` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `os` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `last_activity` datetime NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_user_device`(`user_id` ASC, `device_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_devices
-- ----------------------------
INSERT INTO `user_devices` VALUES (6, 53, '0a6bf6e1360251c5', 'Windows - Chrome', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-05 01:21:14', '2025-09-17 18:04:19');
INSERT INTO `user_devices` VALUES (7, 53, 'f92ddf87d2e8c5ee', 'Windows - Chrome', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-10-12 09:09:34', '2025-10-05 10:31:56');
INSERT INTO `user_devices` VALUES (8, 53, '0ca0626aa88dd0e6', 'Windows - Chrome', 'Chrome', 'Windows', '112.54.13.179', '辽宁省 · 葫芦岛市', '2025-12-07 14:46:37', '2025-11-04 16:57:58');
INSERT INTO `user_devices` VALUES (9, 53, '9f4c6722da403f48', 'Windows - Chrome', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-30 13:57:35', '2026-03-19 13:46:05');
INSERT INTO `user_devices` VALUES (10, 53, 'e01c7405c82bf25d', 'Windows - Chrome', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-22 14:34:13', '2026-03-22 12:15:27');
INSERT INTO `user_devices` VALUES (11, 96, 'e01c7405c82bf25d', 'Windows - Chrome', 'Chrome', 'Windows', '112.54.13.166', '辽宁省 · 葫芦岛市', '2026-03-25 19:47:35', '2026-03-22 14:38:09');
INSERT INTO `user_devices` VALUES (12, 97, 'e01c7405c82bf25d', 'Windows - Chrome', 'Chrome', 'Windows', '112.54.13.172', '辽宁省 · 葫芦岛市', '2026-03-28 12:28:49', '2026-03-28 10:01:03');

-- ----------------------------
-- Table structure for user_learning_records
-- ----------------------------
DROP TABLE IF EXISTS `user_learning_records`;
CREATE TABLE `user_learning_records`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `section_id` int NULL DEFAULT NULL,
  `progress` int NULL DEFAULT 0 COMMENT '学习进度（百分比）',
  `last_learned_at` datetime NULL DEFAULT NULL COMMENT '最后学习时间',
  `total_learning_hours` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '总学习时长（小时）',
  `status` enum('not_started','in_progress','completed') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'not_started' COMMENT '学习状态',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_user_course`(`user_id` ASC, `course_id` ASC) USING BTREE,
  INDEX `course_id`(`course_id` ASC) USING BTREE,
  INDEX `section_id`(`section_id` ASC) USING BTREE,
  CONSTRAINT `user_learning_records_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_learning_records_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_learning_records
-- ----------------------------
INSERT INTO `user_learning_records` VALUES (1, 53, 1, 8, 65, '2025-09-17 10:30:00', 13.00, 'in_progress', '2025-09-01 00:00:00', '2025-09-17 10:30:00');
INSERT INTO `user_learning_records` VALUES (2, 53, 2, 22, 100, '2025-08-30 15:45:00', 15.00, 'completed', '2025-08-15 00:00:00', '2025-08-30 15:45:00');
INSERT INTO `user_learning_records` VALUES (3, 53, 3, NULL, 0, NULL, 0.00, 'not_started', '2025-09-10 00:00:00', '2025-09-10 00:00:00');
INSERT INTO `user_learning_records` VALUES (4, 53, 4, 3, 30, '2025-09-15 09:20:00', 3.60, 'in_progress', '2025-08-20 00:00:00', '2025-09-15 09:20:00');

-- ----------------------------
-- Table structure for user_level_up_notifications
-- ----------------------------
DROP TABLE IF EXISTS `user_level_up_notifications`;
CREATE TABLE `user_level_up_notifications`  (
  `id` bigint NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `old_level` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `new_level` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `upgrade_time` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_level_up_notifications
-- ----------------------------

-- ----------------------------
-- Table structure for user_levels
-- ----------------------------
DROP TABLE IF EXISTS `user_levels`;
CREATE TABLE `user_levels`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_level` int NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `31`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_levels
-- ----------------------------
INSERT INTO `user_levels` VALUES (12, 53, 15);
INSERT INTO `user_levels` VALUES (13, 54, 10);
INSERT INTO `user_levels` VALUES (14, 55, 13);
INSERT INTO `user_levels` VALUES (15, 96, 10);
INSERT INTO `user_levels` VALUES (16, 97, 1);

-- ----------------------------
-- Table structure for user_permissions
-- ----------------------------
DROP TABLE IF EXISTS `user_permissions`;
CREATE TABLE `user_permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`, `user_id`) USING BTREE,
  UNIQUE INDEX `uniq_user_permission`(`user_id` ASC, `permission_id` ASC) USING BTREE,
  INDEX `2`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_permissions
-- ----------------------------
INSERT INTO `user_permissions` VALUES (1, 53, 10);

-- ----------------------------
-- Table structure for user_points
-- ----------------------------
DROP TABLE IF EXISTS `user_points`;
CREATE TABLE `user_points`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `points` int NULL DEFAULT 0 COMMENT '积分值',
  `today_points` int NULL DEFAULT 0 COMMENT '今日积分',
  `total_points` bigint NULL DEFAULT 0 COMMENT '总积分',
  `ranking` int NULL DEFAULT 0 COMMENT '排名',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_points_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_user_points_ranking`(`ranking` ASC) USING BTREE,
  INDEX `idx_user_points_total_points`(`total_points` DESC) USING BTREE,
  CONSTRAINT `user_points_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_points
-- ----------------------------
INSERT INTO `user_points` VALUES (1, 53, 1000, 100, 10000, 1, '2026-03-19 14:39:51');
INSERT INTO `user_points` VALUES (2, 91, 800, 80, 8000, 2, '2026-03-19 14:39:51');
INSERT INTO `user_points` VALUES (3, 92, 600, 60, 6000, 3, '2026-03-19 14:39:51');

-- ----------------------------
-- Table structure for user_profiles
-- ----------------------------
DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `level` int NULL DEFAULT 0,
  `bio` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_profiles
-- ----------------------------
INSERT INTO `user_profiles` VALUES (1, 97, '用户97', '暂无职位', 1, '暂无简介', '2026-03-28 12:22:15', '2026-03-28 12:22:15');
INSERT INTO `user_profiles` VALUES (2, 53, '用户53', '暂无职位', 1, '暂无简介', '2026-03-30 13:53:50', '2026-03-30 13:53:50');

-- ----------------------------
-- Table structure for user_settings
-- ----------------------------
DROP TABLE IF EXISTS `user_settings`;
CREATE TABLE `user_settings`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `notification_settings` json NULL,
  `privacy_settings` json NULL,
  `language` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'zh-CN',
  `theme` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'light',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_settings
-- ----------------------------
INSERT INTO `user_settings` VALUES (1, 1758086602639, '{\"email\": true, \"desktop\": true}', '{\"profileVisible\": true}', 'zh-CN', 'light');
INSERT INTO `user_settings` VALUES (2, 1758087108635, '{\"email\": true, \"desktop\": true}', '{\"profileVisible\": true}', 'zh-CN', 'light');
INSERT INTO `user_settings` VALUES (3, 53, '{\"email\": true, \"desktop\": true}', '{\"profileVisible\": true}', 'zh-CN', 'light');
INSERT INTO `user_settings` VALUES (4, 96, '{\"email\": true, \"desktop\": true}', '{\"profileVisible\": true}', 'zh-CN', 'light');

-- ----------------------------
-- Table structure for user_statistics
-- ----------------------------
DROP TABLE IF EXISTS `user_statistics`;
CREATE TABLE `user_statistics`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `projects_count` int NULL DEFAULT 0,
  `documents_count` int NULL DEFAULT 0,
  `skills_count` int NULL DEFAULT 0,
  `work_years` int NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_statistics
-- ----------------------------
INSERT INTO `user_statistics` VALUES (1, 97, 8, 3, 6, 4, '2026-03-28 12:22:15', '2026-03-28 12:28:26');
INSERT INTO `user_statistics` VALUES (2, 53, 0, 0, 0, 0, '2026-03-30 13:53:50', '2026-03-30 13:53:50');

-- ----------------------------
-- Table structure for user_tags
-- ----------------------------
DROP TABLE IF EXISTS `user_tags`;
CREATE TABLE `user_tags`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `tag_name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_tags
-- ----------------------------

-- ----------------------------
-- Table structure for user_task_center
-- ----------------------------
DROP TABLE IF EXISTS `user_task_center`;
CREATE TABLE `user_task_center`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `points` int NULL DEFAULT 0 COMMENT '积分值',
  `accepted_tasks` int NULL DEFAULT 0 COMMENT '已接受任务数',
  `completed_tasks` int NULL DEFAULT 0 COMMENT '已完成任务数',
  `today_points` int NULL DEFAULT 0 COMMENT '今日积分',
  `level` int NULL DEFAULT 1 COMMENT '用户等级',
  `experience` int NULL DEFAULT 0 COMMENT '用户经验值',
  `next_level_experience` int NULL DEFAULT 1000 COMMENT '升级所需经验值',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_task_center_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `user_task_center_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_task_center
-- ----------------------------
INSERT INTO `user_task_center` VALUES (1, 53, 1250, 15, 12, 150, 3, 1250, 2000, '2026-03-19 14:03:48', '2026-03-19 14:03:48');
INSERT INTO `user_task_center` VALUES (2, 96, 0, 0, 0, 0, 1, 0, 1000, '2026-03-22 18:14:17', '2026-03-22 18:14:17');
INSERT INTO `user_task_center` VALUES (3, 97, 0, 0, 0, 0, 1, 0, 1000, '2026-03-28 11:07:21', '2026-03-28 11:07:21');

-- ----------------------------
-- Table structure for user_weekly_overviews
-- ----------------------------
DROP TABLE IF EXISTS `user_weekly_overviews`;
CREATE TABLE `user_weekly_overviews`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `week_start_date` date NOT NULL,
  `week_end_date` date NOT NULL,
  `documents_created` int NULL DEFAULT 0,
  `tasks_in_progress` int NULL DEFAULT 0,
  `comments_count` int NULL DEFAULT 0,
  `study_time_minutes` int NULL DEFAULT 0,
  `documents_trend` int NULL DEFAULT 0,
  `tasks_trend` int NULL DEFAULT 0,
  `comments_trend` int NULL DEFAULT 0,
  `study_time_trend` int NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_week`(`user_id` ASC, `week_start_date` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_weekly_overviews
-- ----------------------------
INSERT INTO `user_weekly_overviews` VALUES (1, 97, '2026-03-23', '2026-03-29', 1, 3, 0, 9, 4, 5, 0, 0, '2026-03-28 12:22:15');
INSERT INTO `user_weekly_overviews` VALUES (2, 53, '2026-03-30', '2026-04-05', 0, 0, 0, 0, 0, 0, 0, 0, '2026-03-30 13:53:50');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `secret` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `status` int NULL DEFAULT NULL,
  `registration_date` datetime NULL DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT 'user',
  `position` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '职位',
  `contact_info` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '联系方式',
  `avatar` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL COMMENT '头像URL',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_unique_email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `idx_unique_username`(`username` ASC) USING BTREE,
  INDEX `username`(`username` ASC) USING BTREE,
  CONSTRAINT `chk_role_values` CHECK (`role` in (_utf8mb3'temporary',_utf8mb3'user',_utf8mb3'admin'))
) ENGINE = InnoDB AUTO_INCREMENT = 99 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (53, '曾文涛', '曾文涛', '3010180675@qq.com', '$2a$10$qdBlkdqAbymQSHHwG0HdaOn23VWl5EpPoO9RASo8XEL2sWmyMsWI.', 'zwt', 1, '2025-08-05 22:52:56', 'admin', '董事长', '19720187878', NULL);
INSERT INTO `users` VALUES (91, '董胜阳', '董胜阳', 'dongshengyang@example.com', '$2a$10$5b', 'dsy', 1, '2025-09-13 12:54:19', 'user', NULL, NULL, NULL);
INSERT INTO `users` VALUES (92, '刘睿翔', '刘睿翔', 'liuruixiang@example.com', '$2a$10$5b', 'lrx', 1, '2025-09-13 12:54:19', 'user', NULL, NULL, NULL);
INSERT INTO `users` VALUES (96, '西兰花', '西兰花', '2240423956@qq.com', '$2a$10$dmAgnH48pOwXH4UHryrnpu.2RKSJpREbg8G2kaW1YXu7EkBaJbHru', '1234', 1, '2026-03-22 13:44:55', 'admin', NULL, NULL, NULL);
INSERT INTO `users` VALUES (97, 'xsz', NULL, 'WhiteMourning@Foxmail.com', '$2a$10$88Qt6WADu4czNoRiuAhpXuSIwGBfawO3pEtVVOqC0g6Yi267CDXHC', '88888888', 1, '2026-03-28 10:00:10', 'admin', NULL, NULL, NULL);
INSERT INTO `users` VALUES (98, 'wya', NULL, '123456789@qq.com', '$2a$10$UWNuzbDA0m.8.jfK3lrPt.8LYEwhUGpwpckKdHRcGGQWGumCsYkF2', 'wya', 1, '2026-03-30 12:33:52', 'admin', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for video
-- ----------------------------
DROP TABLE IF EXISTS `video`;
CREATE TABLE `video`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `file_path` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `thumbnail` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `duration` int NULL DEFAULT 0,
  `course_id` int NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_course_id`(`course_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of video
-- ----------------------------
INSERT INTO `video` VALUES (2, '1', '1', '64744a97-7d87-4651-9cb7-c470923c51cc.mp4', '/api/files/64744a97-7d87-4651-9cb7-c470923c51cc.mp4', NULL, NULL, 1, '2026-03-29 14:35:54', '2026-03-29 14:35:54');

-- ----------------------------
-- View structure for view_course_comments
-- ----------------------------
DROP VIEW IF EXISTS `view_course_comments`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `view_course_comments` AS select `c`.`id` AS `course_id`,`c`.`title` AS `course_title`,`cc`.`content` AS `content`,`cc`.`likes` AS `likes`,`cc`.`created_at` AS `created_at` from (`courses` `c` left join `course_comments` `cc` on((`c`.`id` = `cc`.`course_id`))) order by `cc`.`created_at` desc;

-- ----------------------------
-- View structure for view_course_progress
-- ----------------------------
DROP VIEW IF EXISTS `view_course_progress`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `view_course_progress` AS select `c`.`id` AS `course_id`,`c`.`title` AS `course_title`,`c`.`total_sections` AS `total_sections`,`c`.`status` AS `course_status`,`ulr`.`progress` AS `progress`,`ulr`.`total_learning_hours` AS `total_learning_hours`,`ulr`.`status` AS `learning_status`,`ulr`.`last_learned_at` AS `last_learned_at` from (`courses` `c` left join `user_learning_records` `ulr` on(((`c`.`id` = `ulr`.`course_id`) and (`ulr`.`user_id` = 53))));

-- ----------------------------
-- View structure for view_learning_paths
-- ----------------------------
DROP VIEW IF EXISTS `view_learning_paths`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `view_learning_paths` AS select `lp`.`id` AS `path_id`,`lp`.`title` AS `path_title`,`lp`.`description` AS `description`,`lp`.`total_hours` AS `total_hours`,`lp`.`total_courses` AS `total_courses`,group_concat(`c`.`title` order by `pc`.`order_number` ASC separator ' → ') AS `course_list` from ((`learning_paths` `lp` left join `path_courses` `pc` on((`lp`.`id` = `pc`.`path_id`))) left join `courses` `c` on((`pc`.`course_id` = `c`.`id`))) group by `lp`.`id`;

-- ----------------------------
-- View structure for view_learning_stats
-- ----------------------------
DROP VIEW IF EXISTS `view_learning_stats`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `view_learning_stats` AS select count(0) AS `total_courses`,sum((case when (`ulr`.`status` = 'completed') then 1 else 0 end)) AS `completed_courses`,sum((case when (`ulr`.`status` = 'in_progress') then 1 else 0 end)) AS `in_progress_courses`,sum(`ulr`.`total_learning_hours`) AS `total_learning_hours`,(select count(0) from `user_badges` where (`user_badges`.`user_id` = 53)) AS `total_badges` from `user_learning_records` `ulr` where (`ulr`.`user_id` = 53);

SET FOREIGN_KEY_CHECKS = 1;
