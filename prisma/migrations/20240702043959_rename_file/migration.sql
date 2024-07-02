-- DropForeignKey
ALTER TABLE `Show` DROP FOREIGN KEY `Show_backgroundImageFileId_fkey`;

-- DropForeignKey
ALTER TABLE `Show` DROP FOREIGN KEY `Show_showLogoFileId_fkey`;

ALTER TABLE `File` RENAME TO `ImageFile`;

-- AddForeignKey
ALTER TABLE `Show` ADD CONSTRAINT `Show_showLogoFileId_fkey` FOREIGN KEY (`showLogoFileId`) REFERENCES `ImageFile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Show` ADD CONSTRAINT `Show_backgroundImageFileId_fkey` FOREIGN KEY (`backgroundImageFileId`) REFERENCES `ImageFile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
