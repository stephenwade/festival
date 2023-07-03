-- CreateTable
CREATE TABLE `Show` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `backgroundColor` VARCHAR(191) NOT NULL,
    `backgroundColorSecondary` VARCHAR(191) NOT NULL,
    `showLogoFileId` VARCHAR(191) NOT NULL,
    `backgroundImageFileId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Show_showLogoFileId_key`(`showLogoFileId`),
    UNIQUE INDEX `Show_backgroundImageFileId_key`(`backgroundImageFileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Set` (
    `id` VARCHAR(191) NOT NULL,
    `artist` VARCHAR(191) NOT NULL,
    `offset` DOUBLE NOT NULL,
    `showId` VARCHAR(191) NOT NULL,
    `audioFileUploadId` VARCHAR(191) NULL,

    UNIQUE INDEX `Set_audioFileUploadId_key`(`audioFileUploadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AudioFile` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `audioUrl` VARCHAR(191) NOT NULL,
    `duration` DOUBLE NOT NULL,
    `audioFileUploadId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AudioFile_audioFileUploadId_key`(`audioFileUploadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AudioFileUpload` (
    `id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `audioUrl` VARCHAR(191) NULL,
    `duration` DOUBLE NULL,
    `convertProgress` DOUBLE NULL,
    `errorMessage` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `File` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminUserAllowlist` (
    `emailAddress` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AdminUserAllowlist_emailAddress_key`(`emailAddress`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Show` ADD CONSTRAINT `Show_showLogoFileId_fkey` FOREIGN KEY (`showLogoFileId`) REFERENCES `File`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Show` ADD CONSTRAINT `Show_backgroundImageFileId_fkey` FOREIGN KEY (`backgroundImageFileId`) REFERENCES `File`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Set` ADD CONSTRAINT `Set_showId_fkey` FOREIGN KEY (`showId`) REFERENCES `Show`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Set` ADD CONSTRAINT `Set_audioFileUploadId_fkey` FOREIGN KEY (`audioFileUploadId`) REFERENCES `AudioFileUpload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AudioFile` ADD CONSTRAINT `AudioFile_audioFileUploadId_fkey` FOREIGN KEY (`audioFileUploadId`) REFERENCES `AudioFileUpload`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
