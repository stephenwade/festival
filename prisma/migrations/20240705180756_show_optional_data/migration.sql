-- DropForeignKey
ALTER TABLE `Show` DROP FOREIGN KEY `Show_backgroundImageFileId_fkey`;

-- DropForeignKey
ALTER TABLE `Show` DROP FOREIGN KEY `Show_showLogoFileId_fkey`;

ALTER TABLE `Show` ADD COLUMN `slug` VARCHAR(191) NULL,
    ADD COLUMN `timeZone` VARCHAR(191) NULL DEFAULT 'America/New_York',
    RENAME COLUMN `showLogoFileId` to `logoImageFileId`;

UPDATE `Show` SET `slug` = `id`;

ALTER TABLE `Show` MODIFY `slug` VARCHAR(191) NOT NULL,
    ALTER `timeZone` DROP DEFAULT,
    MODIFY `logoImageFileId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Show` MODIFY `description` VARCHAR(191) NULL,
    MODIFY `startDate` DATETIME(3) NULL,
    MODIFY `backgroundColor` VARCHAR(191) NULL,
    MODIFY `backgroundColorSecondary` VARCHAR(191) NULL,
    MODIFY `backgroundImageFileId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Show_slug_key` ON `Show`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `Show_logoImageFileId_key` ON `Show`(`logoImageFileId`);

-- AddForeignKey
ALTER TABLE `Show` ADD CONSTRAINT `Show_logoImageFileId_fkey` FOREIGN KEY (`logoImageFileId`) REFERENCES `ImageFile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Show` ADD CONSTRAINT `Show_backgroundImageFileId_fkey` FOREIGN KEY (`backgroundImageFileId`) REFERENCES `ImageFile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
