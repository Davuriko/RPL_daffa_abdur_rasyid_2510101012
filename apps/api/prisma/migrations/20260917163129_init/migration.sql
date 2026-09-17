-- CreateTable
CREATE TABLE `Store` (
    `Id` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `OwnerName` VARCHAR(191) NOT NULL,
    `WhatsappNumber` VARCHAR(191) NOT NULL,
    `CampusLocation` VARCHAR(191) NOT NULL,
    `IsOpen` BOOLEAN NOT NULL DEFAULT true,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `Id` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `Id` VARCHAR(191) NOT NULL,
    `StoreId` VARCHAR(191) NOT NULL,
    `CategoryId` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `Description` TEXT NOT NULL,
    `Price` INTEGER NOT NULL,
    `ImageUrl` VARCHAR(191) NOT NULL,
    `IsAvailable` BOOLEAN NOT NULL DEFAULT true,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Product_StoreId_idx`(`StoreId`),
    INDEX `Product_CategoryId_idx`(`CategoryId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `Id` VARCHAR(191) NOT NULL,
    `StoreId` VARCHAR(191) NOT NULL,
    `CustomerName` VARCHAR(191) NOT NULL,
    `CustomerWhatsapp` VARCHAR(191) NOT NULL,
    `DeliveryLocation` VARCHAR(191) NOT NULL,
    `Notes` TEXT NOT NULL,
    `TotalPrice` INTEGER NOT NULL,
    `Status` ENUM('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Order_StoreId_idx`(`StoreId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `Id` VARCHAR(191) NOT NULL,
    `OrderId` VARCHAR(191) NOT NULL,
    `ProductId` VARCHAR(191) NOT NULL,
    `Quantity` INTEGER NOT NULL,
    `UnitPrice` INTEGER NOT NULL,
    `Subtotal` INTEGER NOT NULL,

    INDEX `OrderItem_OrderId_idx`(`OrderId`),
    INDEX `OrderItem_ProductId_idx`(`ProductId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_StoreId_fkey` FOREIGN KEY (`StoreId`) REFERENCES `Store`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_CategoryId_fkey` FOREIGN KEY (`CategoryId`) REFERENCES `Category`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_StoreId_fkey` FOREIGN KEY (`StoreId`) REFERENCES `Store`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_OrderId_fkey` FOREIGN KEY (`OrderId`) REFERENCES `Order`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_ProductId_fkey` FOREIGN KEY (`ProductId`) REFERENCES `Product`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;
