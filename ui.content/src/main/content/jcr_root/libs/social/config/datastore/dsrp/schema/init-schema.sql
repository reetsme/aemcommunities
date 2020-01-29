-- Soco init schema for communities
-- version 1.0.0

SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema communities
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `communities` DEFAULT CHARACTER SET utf8 ;
USE `communities` ;

-- -----------------------------------------------------
-- Table `communities`.`ugc_content`
-- -----------------------------------------------------
CREATE TABLE `communities`.`ugc_content` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `hash` VARCHAR(64) NOT NULL,
  `providerid` BLOB NULL,
  `parenthash` VARCHAR(64) NOT NULL,
  `parentid` BLOB NULL,
  `threadid` VARCHAR(255) NULL,
  `resourcetype` VARCHAR(255) NULL,
  `basetype` VARCHAR(255) NULL,
  `authorizable_id` VARCHAR(255) NULL,
  `added_date` BIGINT(11) NULL,
  `published_date` BIGINT(11) NULL,
  `title` MEDIUMBLOB NULL,
  `cqdata` LONGBLOB NULL,
  `verbatim` LONGBLOB NULL,
  PRIMARY KEY (`id`),
  INDEX `hash_INDEX` (`hash` ASC),
  INDEX `parenthash_INDEX` (`parenthash` ASC),
  INDEX `added_date_INDEX` (`added_date` ASC),
  INDEX `published_date_INDEX` (`published_date` ASC));

-- -----------------------------------------------------
-- Table `communities`.`attachments`
-- -----------------------------------------------------
  CREATE TABLE `communities`.`attachments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `type` VARCHAR(15) NULL,
  `providerid` BLOB NULL,
  `hash_providerid` VARCHAR(64) NULL,
  `parentid` BLOB NULL,
  `hash_parentid` VARCHAR(64) NULL,
  `threadid` VARCHAR(255) NULL,
  `metadata` BLOB NULL,
  `data` LONGBLOB NULL,
  PRIMARY KEY (`id`),
  INDEX `providerhash` (`hash_providerid` ASC),
  INDEX `parenthash` (`hash_parentid` ASC));


SET SQL_MODE=@OLD_SQL_MODE;
