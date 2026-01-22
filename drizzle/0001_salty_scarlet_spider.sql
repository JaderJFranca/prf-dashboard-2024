CREATE TABLE `accident_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uf` varchar(2) NOT NULL,
	`total_accidents` int NOT NULL,
	`total_deaths` int NOT NULL,
	`total_severe_injuries` int NOT NULL,
	`total_minor_injuries` int NOT NULL,
	`total_unharmed` int NOT NULL,
	`data_json` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accident_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `accident_stats_uf_unique` UNIQUE(`uf`)
);
