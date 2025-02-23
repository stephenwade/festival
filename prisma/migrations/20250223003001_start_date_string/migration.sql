DELETE FROM `Show`;

-- AlterTable
ALTER TABLE `Show` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    MODIFY `startDate` VARCHAR(191) NULL;
