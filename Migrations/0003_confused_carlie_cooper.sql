CREATE TABLE `Log` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accessToken` varchar(255) NOT NULL,
	`refreshToken` varchar(255) NOT NULL,
	`time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `Log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Register` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`age` int,
	`DOB` date NOT NULL,
	`address` varchar(255) NOT NULL,
	`phoneNum` bigint unsigned NOT NULL,
	`password` varchar(255) NOT NULL,
	CONSTRAINT `Register_id` PRIMARY KEY(`id`)
);
