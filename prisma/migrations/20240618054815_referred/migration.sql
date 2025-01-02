/*
  Warnings:

  - You are about to alter the column `time` on the `LogPaths` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `arrivalTime` on the `LogPaths` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `estTimeOfEntry` on the `LogPaths` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `coordinatedExitTime` on the `LogPaths` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `time` on the `Logs` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `logTime` on the `Paths` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `time` on the `Paths` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `time` on the `Report` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `time` on the `SectorLogs` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `estTimeOfEntry` on the `Sfpis` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `departureTime` on the `Sfpis` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `scheduledTime` on the `Sfpis` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `actualLandingTime` on the `Sfpis` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `etd` on the `flightPermit` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `eta` on the `flightPermit` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `LogPaths` MODIFY `time` DATETIME NULL,
    MODIFY `arrivalTime` DATETIME NULL,
    MODIFY `estTimeOfEntry` DATETIME NULL,
    MODIFY `coordinatedExitTime` DATETIME NULL;

-- AlterTable
ALTER TABLE `Logs` MODIFY `time` DATETIME NULL;

-- AlterTable
ALTER TABLE `Paths` MODIFY `logTime` DATETIME NULL,
    MODIFY `time` DATETIME NULL;

-- AlterTable
ALTER TABLE `Report` MODIFY `time` DATETIME NULL;

-- AlterTable
ALTER TABLE `SectorLogs` MODIFY `time` DATETIME NULL;

-- AlterTable
ALTER TABLE `Sfpis` MODIFY `estTimeOfEntry` DATETIME NULL,
    MODIFY `departureTime` DATETIME NULL,
    MODIFY `scheduledTime` DATETIME NULL,
    MODIFY `actualLandingTime` DATETIME NULL;

-- AlterTable
ALTER TABLE `flightPermit` MODIFY `etd` DATETIME NULL,
    MODIFY `eta` DATETIME NULL;

-- CreateTable
CREATE TABLE `referred` (
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
    `fpl` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
