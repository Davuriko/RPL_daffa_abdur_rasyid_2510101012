-- CreateTable
CREATE TABLE `Review` (
    `Id` VARCHAR(191) NOT NULL,
    `ProductId` VARCHAR(191) NOT NULL,
    `CustomerWhatsapp` VARCHAR(191) NOT NULL,
    `Rating` INTEGER NOT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Review_ProductId_idx`(`ProductId`),
    UNIQUE INDEX `Review_ProductId_CustomerWhatsapp_key`(`ProductId`, `CustomerWhatsapp`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_ProductId_fkey` FOREIGN KEY (`ProductId`) REFERENCES `Product`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
