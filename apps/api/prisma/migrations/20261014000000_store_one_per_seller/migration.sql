-- CreateIndex
CREATE UNIQUE INDEX `Store_SellerId_key` ON `Store`(`SellerId`);

-- DropIndex
DROP INDEX `Store_SellerId_idx` ON `Store`;
