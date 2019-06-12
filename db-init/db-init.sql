-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: tarpaulin
-- ------------------------------------------------------
-- Server version 5.7.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
  (0,'Admin','admin@tarpaulin.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','admin'),
  (1,'Example 1','user1@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','student'),
  (2,'Example 2','user2@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','instructor'),
  (3,'Example 3','user3@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','student'),
  (4,'Example 4','user4@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','instructor'),
  (5,'Example 5','user5@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','student'),
  (6,'Example 6','user6@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','instructor'),
  (7,'Example 7','user7@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','student'),
  (8,'Example 8','user8@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','instructor'),
  (9,'Example 9','user9@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','student'),
  (10,'Example 10','user10@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','instructor'),
  (11,'Example 11','user11@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','student'),
  (12,'Example 12','user12@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','instructor'),
  (13,'Example 13','user13@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','student'),
  (14,'Example 14','user14@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','instructor'),
  (15,'Example 15','user15@example.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','student');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `number` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `term` varchar(255) NOT NULL,
  `instructorid` mediumint(9) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_instructorid` (`instructorid`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructorid`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES
  (1,'CS','444','Operating Systems II','F19',2),
  (2,'MTH','306','Linear Algebra','W20',4),
  (3,'ENGR','202','General Engineering','Sp20',6),
  (4,'CS','444','Operating Systems II','Su20',2),
  (5,'MTH','306','Linear Algebra','F19',4),
  (6,'ENGR','202','General Engineering','W20',6),
  (7,'CS','444','Operating Systems II','Sp20',2),
  (8,'MTH','306','Linear Algebra','Su20',4),
  (9,'ENGR','202','General Engineering','F19',6),
  (10,'CS','444','Operating Systems II','W20',2),
  (11,'MTH','306','Linear Algebra','Sp20',4),
  (12,'ENGR','202','General Engineering','Su20',6);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignments` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `courseid` mediumint(9) NOT NULL,
  `title` varchar(255) NOT NULL,
  `points` mediumint(9) NOT NULL,
  `due` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_courseid` (`courseid`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`courseid`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES
  (1,1,'Example Assignment 0',80,'2019-06-02T15:45:20'),
  (2,2,'Example Assignment 1',81,'2019-06-02T15:45:20'),
  (3,3,'Example Assignment 2',82,'2019-06-02T15:45:20'),
  (4,4,'Example Assignment 3',83,'2019-06-02T15:45:20'),
  (5,5,'Example Assignment 4',84,'2019-06-02T15:45:20'),
  (6,6,'Example Assignment 5',85,'2019-06-02T15:45:20'),
  (7,7,'Example Assignment 6',86,'2019-06-02T15:45:20'),
  (8,8,'Example Assignment 7',87,'2019-06-02T15:45:20'),
  (9,9,'Example Assignment 8',88,'2019-06-02T15:45:20'),
  (10,10,'Example Assignment 9',89,'2019-06-02T15:45:20'),
  (11,11,'Example Assignment 10',90,'2019-06-02T15:45:20'),
  (12,12,'Example Assignment 11',91,'2019-06-02T15:45:20'),
  (13,1,'Example Assignment 12',92,'2019-06-02T15:45:20'),
  (14,2,'Example Assignment 13',93,'2019-06-02T15:45:20'),
  (15,3,'Example Assignment 14',94,'2019-06-02T15:45:20'),
  (16,4,'Example Assignment 15',95,'2019-06-02T15:45:20'),
  (17,5,'Example Assignment 16',96,'2019-06-02T15:45:20'),
  (18,6,'Example Assignment 17',97,'2019-06-02T15:45:20'),
  (19,7,'Example Assignment 18',80,'2019-06-02T15:45:20'),
  (20,8,'Example Assignment 19',81,'2019-06-02T15:45:20'),
  (21,9,'Example Assignment 20',82,'2019-06-02T15:45:20'),
  (22,10,'Example Assignment 21',83,'2019-06-02T15:45:20'),
  (23,11,'Example Assignment 22',84,'2019-06-02T15:45:20'),
  (24,12,'Example Assignment 23',85,'2019-06-02T15:45:20'),
  (25,1,'Example Assignment 24',86,'2019-06-02T15:45:20'),
  (26,2,'Example Assignment 25',87,'2019-06-02T15:45:20'),
  (27,3,'Example Assignment 26',88,'2019-06-02T15:45:20'),
  (28,4,'Example Assignment 27',89,'2019-06-02T15:45:20'),
  (29,5,'Example Assignment 28',90,'2019-06-02T15:45:20'),
  (30,6,'Example Assignment 29',91,'2019-06-02T15:45:20'),
  (31,7,'Example Assignment 30',92,'2019-06-02T15:45:20'),
  (32,8,'Example Assignment 31',93,'2019-06-02T15:45:20'),
  (33,9,'Example Assignment 32',94,'2019-06-02T15:45:20'),
  (34,10,'Example Assignment 33',95,'2019-06-02T15:45:20'),
  (35,11,'Example Assignment 34',96,'2019-06-02T15:45:20'),
  (36,12,'Example Assignment 35',97,'2019-06-02T15:45:20');
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `submissions` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `assignmentid` mediumint(9) NOT NULL,
  `studentid` mediumint(9) NOT NULL,
  `timestamp` varchar(255) NOT NULL,
  `file` text,
  PRIMARY KEY (`id`),
  KEY `idx_studentid` (`studentid`),
  KEY `idx_assignmentid` (`assignmentid`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`studentid`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`assignmentid`) REFERENCES `assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES
  (1,1,1,'2019-06-11T21:47:41',NULL),
  (2,2,3,'2019-06-11T21:47:41',NULL),
  (3,3,5,'2019-06-11T21:47:41',NULL),
  (4,4,7,'2019-06-11T21:47:41',NULL),
  (5,5,9,'2019-06-11T21:47:41',NULL),
  (6,6,11,'2019-06-11T21:47:41',NULL),
  (7,7,13,'2019-06-11T21:47:41',NULL),
  (8,8,15,'2019-06-11T21:47:41',NULL),
  (9,9,1,'2019-06-11T21:47:41',NULL),
  (10,10,3,'2019-06-11T21:47:41',NULL),
  (11,11,5,'2019-06-11T21:47:41',NULL),
  (12,12,7,'2019-06-11T21:47:41',NULL),
  (13,13,9,'2019-06-11T21:47:41',NULL),
  (14,14,11,'2019-06-11T21:47:41',NULL),
  (15,15,13,'2019-06-11T21:47:41',NULL),
  (16,16,15,'2019-06-11T21:47:41',NULL),
  (17,17,1,'2019-06-11T21:47:41',NULL),
  (18,18,3,'2019-06-11T21:47:41',NULL),
  (19,19,5,'2019-06-11T21:47:41',NULL),
  (20,20,7,'2019-06-11T21:47:41',NULL),
  (21,21,9,'2019-06-11T21:47:41',NULL),
  (22,22,11,'2019-06-11T21:47:41',NULL),
  (23,23,13,'2019-06-11T21:47:41',NULL),
  (24,24,15,'2019-06-11T21:47:41',NULL),
  (25,25,1,'2019-06-11T21:47:41',NULL),
  (26,26,3,'2019-06-11T21:47:41',NULL),
  (27,27,5,'2019-06-11T21:47:41',NULL),
  (28,28,7,'2019-06-11T21:47:41',NULL),
  (29,29,9,'2019-06-11T21:47:41',NULL),
  (30,30,11,'2019-06-11T21:47:41',NULL),
  (31,31,13,'2019-06-11T21:47:41',NULL),
  (32,32,15,'2019-06-11T21:47:41',NULL),
  (33,33,1,'2019-06-11T21:47:41',NULL),
  (34,34,3,'2019-06-11T21:47:41',NULL),
  (35,35,5,'2019-06-11T21:47:41',NULL),
  (36,36,7,'2019-06-11T21:47:41',NULL),
  (37,1,9,'2019-06-11T21:47:41',NULL),
  (38,2,11,'2019-06-11T21:47:41',NULL),
  (39,3,13,'2019-06-11T21:47:41',NULL),
  (40,4,15,'2019-06-11T21:47:41',NULL),
  (41,5,1,'2019-06-11T21:47:41',NULL),
  (42,6,3,'2019-06-11T21:47:41',NULL),
  (43,7,5,'2019-06-11T21:47:41',NULL),
  (44,8,7,'2019-06-11T21:47:41',NULL),
  (45,9,9,'2019-06-11T21:47:41',NULL),
  (46,10,11,'2019-06-11T21:47:41',NULL),
  (47,11,13,'2019-06-11T21:47:41',NULL),
  (48,12,15,'2019-06-11T21:47:41',NULL),
  (49,13,1,'2019-06-11T21:47:41',NULL),
  (50,14,3,'2019-06-11T21:47:41',NULL),
  (51,15,5,'2019-06-11T21:47:41',NULL),
  (52,16,7,'2019-06-11T21:47:41',NULL),
  (53,17,9,'2019-06-11T21:47:41',NULL),
  (54,18,11,'2019-06-11T21:47:41',NULL),
  (55,19,13,'2019-06-11T21:47:41',NULL),
  (56,20,15,'2019-06-11T21:47:41',NULL),
  (57,21,1,'2019-06-11T21:47:41',NULL),
  (58,22,3,'2019-06-11T21:47:41',NULL),
  (59,23,5,'2019-06-11T21:47:41',NULL),
  (60,24,7,'2019-06-11T21:47:41',NULL),
  (61,25,9,'2019-06-11T21:47:41',NULL),
  (62,26,11,'2019-06-11T21:47:41',NULL),
  (63,27,13,'2019-06-11T21:47:41',NULL),
  (64,28,15,'2019-06-11T21:47:41',NULL),
  (65,29,1,'2019-06-11T21:47:41',NULL),
  (66,30,3,'2019-06-11T21:47:41',NULL),
  (67,31,5,'2019-06-11T21:47:41',NULL),
  (68,32,7,'2019-06-11T21:47:41',NULL),
  (69,33,9,'2019-06-11T21:47:41',NULL),
  (70,34,11,'2019-06-11T21:47:41',NULL),
  (71,35,13,'2019-06-11T21:47:41',NULL),
  (72,36,15,'2019-06-11T21:47:41',NULL);
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-05-16  6:47:05
