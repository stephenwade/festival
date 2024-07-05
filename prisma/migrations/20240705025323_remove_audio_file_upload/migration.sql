UPDATE `AudioFile`
JOIN `AudioFileUpload` ON `AudioFile`.`audioFileUploadId` = `AudioFileUpload`.`id`
SET `AudioFile`.`name` = `AudioFileUpload`.`name`;

ALTER TABLE `Set` ADD COLUMN `audioFileId` VARCHAR(191) NULL;

UPDATE `Set`
JOIN `AudioFileUpload` ON `Set`.`audioFileUploadId` = `AudioFileUpload`.`id`
JOIN `AudioFile` ON `AudioFileUpload`.`id` = `AudioFile`.`audioFileUploadId`
SET `Set`.`audioFileId` = `AudioFile`.`id`;

-- DropForeignKey
ALTER TABLE `Set` DROP FOREIGN KEY `Set_audioFileUploadId_fkey`;

ALTER TABLE `Set` DROP COLUMN `audioFileUploadId`;

-- DropForeignKey
ALTER TABLE `AudioFile` DROP FOREIGN KEY `AudioFile_audioFileUploadId_fkey`;

-- AlterTable
ALTER TABLE `AudioFile` DROP COLUMN `audioFileUploadId`,
    ADD COLUMN `conversionProgress` DOUBLE NULL,
    ADD COLUMN `conversionStatus` ENUM('CHECKING', 'CONVERTING', 'UPLOADING', 'DONE', 'ERROR') NOT NULL DEFAULT 'DONE',
    ADD COLUMN `errorMessage` VARCHAR(191) NULL,
    MODIFY `duration` DOUBLE NULL;

ALTER TABLE `AudioFile` RENAME COLUMN `audioUrl` TO `url`,
    ALTER `conversionStatus` DROP DEFAULT;

ALTER TABLE `AudioFile` MODIFY `url` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `AudioFileUpload`;

-- CreateIndex
CREATE UNIQUE INDEX `Set_audioFileId_key` ON `Set`(`audioFileId`);

-- AddForeignKey
ALTER TABLE `Set` ADD CONSTRAINT `Set_audioFileId_fkey` FOREIGN KEY (`audioFileId`) REFERENCES `AudioFile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
