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
  - You are about to alter the column `estTimeOfEntry` on the `referred` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `departureTime` on the `referred` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `scheduledTime` on the `referred` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `actualLandingTime` on the `referred` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

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

-- AlterTable
ALTER TABLE `referred` MODIFY `estTimeOfEntry` DATETIME NULL,
    MODIFY `departureTime` DATETIME NULL,
    MODIFY `scheduledTime` DATETIME NULL,
    MODIFY `actualLandingTime` DATETIME NULL,
    MODIFY `fpl` TEXT NULL;
