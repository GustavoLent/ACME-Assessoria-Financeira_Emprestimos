CREATE TABLE IF NOT EXISTS `status` (
	`ID` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(15) NOT NULL,

    PRIMARY KEY (`ID`)
);
ALTER TABLE `status` ADD CONSTRAINT idx_uniqueStatus UNIQUE (`description`);

CREATE TABLE IF NOT EXISTS `loans` (
	`ID` INTEGER NOT NULL AUTO_INCREMENT,
	`userID` INTEGER NOT NULL,
	`value` FLOAT NOT NULL,
	`date` DATETIME NOT NULL,
	`statusID` INTEGER NOT NULL,

    PRIMARY KEY (`ID`),
    FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`)
);
ALTER TABLE `loans` ADD CONSTRAINT idx_uniqueLoan UNIQUE (`userID`, `value`, `date`);

INSERT INTO loans.status (ID, description)
VALUES
    (1, 'started'),
    (2, 'pending'),
    (3, 'approved'),
    (4, 'rejected');
