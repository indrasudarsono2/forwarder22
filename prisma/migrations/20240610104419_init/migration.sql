-- CreateTable
CREATE TABLE `Sfpis` (
    `id` VARCHAR(191) NOT NULL,
    `state` VARCHAR(100) NULL,
    `travelType` VARCHAR(100) NULL,
    `flightType` VARCHAR(100) NULL,
    `flightRules` VARCHAR(100) NULL,
    `callsign` VARCHAR(100) NULL,
    `aircraftReg` VARCHAR(100) NULL,
    `aircraftType` VARCHAR(100) NULL,
    `wakeTurbulance` VARCHAR(100) NULL,
    `navigationEquip` VARCHAR(100) NULL,
    `surveillanceEquip` VARCHAR(100) NULL,
    `ssrCode` VARCHAR(100) NULL,
    `estTimeOfEntry` DATETIME NULL,
    `clearedFlightLevel` INTEGER NULL,
    `exitFlightLevel` INTEGER NULL,
    `requestedFlightLevel` INTEGER NULL,
    `cruisingSpeed` INTEGER NULL,
    `adep` VARCHAR(100) NULL,
    `ades` VARCHAR(100) NULL,
    `departureTime` DATETIME NULL,
    `scheduledTime` DATETIME NULL,
    `operatorInfo` VARCHAR(100) NULL,
    `terminateMode` VARCHAR(100) NULL,
    `xflApprovalState` VARCHAR(100) NULL,
    `coordinationState` VARCHAR(100) NULL,
    `revision` VARCHAR(100) NULL,
    `operatorInfo2` VARCHAR(100) NULL,
    `assignedSpeed` INTEGER NULL,
    `assignedHeading` INTEGER NULL,
    `radarIdentification` VARCHAR(100) NULL,
    `actualLandingTime` DATETIME NULL,
    `numAircrafts` INTEGER NULL,
    `fuel` VARCHAR(100) NULL,
    `specApproach` VARCHAR(100) NULL,
    `alternateSsrCode` VARCHAR(100) NULL,
    `pbnEquip` VARCHAR(100) NULL,
    `fplFormat` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sfpiId` VARCHAR(191) NOT NULL,
    `time` DATETIME NULL,
    `mod` VARCHAR(100) NULL,
    `updType` VARCHAR(200) NULL,
    `data` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogPaths` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sfpiId` VARCHAR(191) NOT NULL,
    `time` DATETIME NULL,
    `mod` VARCHAR(100) NULL,
    `updType` VARCHAR(200) NULL,
    `arrivalTime` DATETIME NULL,
    `estTimeOfEntry` DATETIME NULL,
    `coordinatedExitTime` DATETIME NULL,
    `previousFir` VARCHAR(100) NULL,
    `nextFir` VARCHAR(100) NULL,
    `numWaypoints` INTEGER NULL,
    `paths` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Paths` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sfpiId` VARCHAR(191) NOT NULL,
    `logTime` DATETIME NULL,
    `pointName` VARCHAR(100) NULL,
    `time` DATETIME NULL,
    `status` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sfpiId` VARCHAR(191) NOT NULL,
    `sector` VARCHAR(191) NULL,
    `time` DATETIME NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectorLogs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sfpiId` VARCHAR(191) NOT NULL,
    `time` DATETIME NULL,
    `onCwp` VARCHAR(50) NULL,
    `initialState` VARCHAR(100) NOT NULL,
    `currentSector` VARCHAR(50) NULL,
    `newSector` VARCHAR(50) NULL,
    `cwpIndentifier` VARCHAR(50) NULL,
    `handoverState` VARCHAR(50) NULL,
    `passedSector` VARCHAR(50) NULL,
    `isEntry` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flightPermit` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `callSign` VARCHAR(191) NULL,
    `acftType` VARCHAR(191) NULL,
    `adep` VARCHAR(191) NULL,
    `ades` VARCHAR(191) NULL,
    `etd` DATETIME NULL,
    `eta` DATETIME NULL,
    `dayOps` VARCHAR(191) NULL,
    `permissionNumber` VARCHAR(191) NULL,
    `validPeriod` VARCHAR(191) NULL,
    `operator` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Logs` ADD CONSTRAINT `Logs_sfpiId_fkey` FOREIGN KEY (`sfpiId`) REFERENCES `Sfpis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogPaths` ADD CONSTRAINT `LogPaths_sfpiId_fkey` FOREIGN KEY (`sfpiId`) REFERENCES `Sfpis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paths` ADD CONSTRAINT `Paths_sfpiId_fkey` FOREIGN KEY (`sfpiId`) REFERENCES `Sfpis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_sfpiId_fkey` FOREIGN KEY (`sfpiId`) REFERENCES `Sfpis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectorLogs` ADD CONSTRAINT `SectorLogs_sfpiId_fkey` FOREIGN KEY (`sfpiId`) REFERENCES `Sfpis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
