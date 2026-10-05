-- AlterTable
ALTER TABLE `store` ADD COLUMN `IsVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `SellerId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `User` (
    `Id` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `PasswordHash` VARCHAR(191) NOT NULL,
    `Role` ENUM('ADMIN', 'SELLER', 'BUYER') NOT NULL DEFAULT 'BUYER',
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_Email_key`(`Email`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Store_SellerId_idx` ON `Store`(`SellerId`);

-- AddForeignKey
ALTER TABLE `Store` ADD CONSTRAINT `Store_SellerId_fkey` FOREIGN KEY (`SellerId`) REFERENCES `User`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;
