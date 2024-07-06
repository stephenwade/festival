UPDATE `Show` SET `timeZone` = 'America/New_York' WHERE `timeZone` IS NULL;

-- AlterTable
ALTER TABLE `Show` MODIFY `timeZone` VARCHAR(191) NOT NULL;
