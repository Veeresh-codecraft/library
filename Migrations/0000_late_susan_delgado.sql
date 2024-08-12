CREATE TABLE `books` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`author` varchar(255) NOT NULL,
	`publisher` varchar(255) NOT NULL,
	`genre` varchar(255) NOT NULL,
	`isbNo` int NOT NULL,
	`numofPages` int NOT NULL,
	`totalNumberOfCopies` int NOT NULL,
	`availableNumberOfCopies` int NOT NULL,
	CONSTRAINT `books_id` PRIMARY KEY(`id`),
	CONSTRAINT `books_isbNo_unique` UNIQUE(`isbNo`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`transactionId` serial AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`userId` int NOT NULL,
	`transactionType` enum('borrow','return') NOT NULL,
	`transactionDate` datetime NOT NULL,
	`dueDate` datetime,
	`returnDate` datetime,
	`status` enum('pending','completed','overdue') NOT NULL,
	`lateFees` int,
	CONSTRAINT `transactions_transactionId` PRIMARY KEY(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`age` int,
	`dob` date NOT NULL,
	`address` varchar(255) NOT NULL,
	`bigintU` bigint unsigned NOT NULL,
	CONSTRAINT `Users_id` PRIMARY KEY(`id`)
);
