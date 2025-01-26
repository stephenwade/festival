DELETE FROM `AudioFile` WHERE `conversionStatus` = 'UPLOADING' OR `url` IS NULL;

-- AlterTable
ALTER TABLE `AudioFile` MODIFY `url` VARCHAR(191) NOT NULL,
    MODIFY `conversionStatus` ENUM('USER_UPLOAD', 'CHECKING', 'CONVERTING', 'RE_UPLOAD', 'DONE', 'ERROR') NOT NULL;
