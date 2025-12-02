CREATE DATABASE IF NOT EXISTS 436db;
USE 436db;

DROP TABLE IF EXISTS screenname;
DROP TABLE IF EXISTS players;

-- Create table for screennames
CREATE TABLE IF NOT EXISTS screenname (
  screenname VARCHAR(50) PRIMARY KEY,
  datetime DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create table for players
CREATE TABLE IF NOT EXISTS players (
  game_id INT AUTO_INCREMENT UNIQUE PRIMARY KEY,
  x_player VARCHAR(50),
  o_player VARCHAR(50)
);
