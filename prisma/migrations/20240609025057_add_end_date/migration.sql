ALTER TABLE `Show` ADD COLUMN `endDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `Show`
JOIN (
  SELECT `Set`.*, ROW_NUMBER() OVER (PARTITION BY `showId` ORDER BY `offset` DESC) AS `row` FROM `Set`
) AS `SetRows` ON `Show`.`id` = `SetRows`.`showId` and `SetRows`.`row` = 1
JOIN `AudioFileUpload` ON `SetRows`.`audioFileUploadId` = `AudioFileUpload`.`id`
SET `endDate` = TIMESTAMPADD(SECOND, `SetRows`.`offset` + `AudioFileUpload`.`duration`, `Show`.`startDate`);

ALTER TABLE `Show` ALTER COLUMN `endDate` DROP DEFAULT;
