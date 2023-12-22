-- DropForeignKey
ALTER TABLE `AudioFile` DROP FOREIGN KEY `AudioFile_audioFileUploadId_fkey`;

-- AddForeignKey
ALTER TABLE `AudioFile` ADD CONSTRAINT `AudioFile_audioFileUploadId_fkey` FOREIGN KEY (`audioFileUploadId`) REFERENCES `AudioFileUpload`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
