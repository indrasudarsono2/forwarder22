const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const fs = require('fs');
const xlsx = require('xlsx');
const sector = require('../sector.json');

const all = async () => {
  const acc = sector[0]["ACC"];
  const app = sector[1]["APP"];
  const sectorSelected = [...acc, ...app]
  
    // Initialize an array to hold the sector names
  const sectors = [];

  // Iterate through each object in the data array
  sectorSelected.forEach(item => {
    // Get the keys (sector names) from each object and push them to the sectors array
    Object.keys(item).forEach(sector => {
      sectors.push(sector);
    });
  });

  await repSec("UBND");
  // for(let a = 0 ; a < sectors.length ; a++){
  //   await repSec(sectors[a]);
  //   // console.log(sectors[a]);
  // }
}

all();

async function repSec(singleSector) {
  const report = await prisma.report.findMany({
    where: {
      sector: singleSector,
      time: {
        gte: dayjs.utc(`2024-10-01T00:00:00Z`).toDate(),
        lt: dayjs.utc(`2024-11-01T00:00:00Z`).toDate(),
      }
    },
    select: {
      sfpiId: true,
      sector: true,
      time: true
    },
  });

  const groupedData = new Map();

  // Iterate through the data
  report.forEach(entry => {
    const sectorOwner = entry.sector;
    const time = new Date(entry.time);
    const hour = time.getHours();

    // Check if the sector is already in the map
    if (!groupedData.has(sectorOwner)) {
      // If not, add it with an empty array
      groupedData.set(sectorOwner, []);
    }

    // Push the entry to the corresponding sectorOwner and hour
    groupedData.get(sectorOwner).push({ ...entry, hour });
  });

  // Convert the Map to an array of objects
  const result = Array.from(groupedData, ([sectorOwner, entries]) => ({ sectorOwner, entries }));

  const data = result[0].entries;

  // Initialize an object to hold the results
  const nextGroupedData = {};

  // Populate the object
  data.forEach(entry => {
    if (entry.time) {
      const date = dayjs(entry.time).format('YYYY-MM-DD');
      const hour = entry.hour;
      const timeSlot = `${hour.toString().padStart(2, '0')}00-${hour.toString().padStart(2, '0')}59`;

      if (!nextGroupedData[date]) {
        nextGroupedData[date] = {
          "0000-0059": 0,
          "0100-0159": 0,
          "0200-0259": 0,
          "0300-0359": 0,
          "0400-0459": 0,
          "0500-0559": 0,
          "0600-0659": 0,
          "0700-0759": 0,
          "0800-0859": 0,
          "0900-0959": 0,
          "1000-1059": 0,
          "1100-1159": 0,
          "1200-1259": 0,
          "1300-1359": 0,
          "1400-1459": 0,
          "1500-1559": 0,
          "1600-1659": 0,
          "1700-1759": 0,
          "1800-1859": 0,
          "1900-1959": 0,
          "2000-2059": 0,
          "2100-2159": 0,
          "2200-2259": 0,
          "2300-2359": 0
        };
      }

      nextGroupedData[date][timeSlot]++;
    }
  });

  // Convert to the required format
  const outputData = Object.keys(nextGroupedData).map(date => {
    return {
      date: date,
      ...nextGroupedData[date]
    };
  });

  // Create a worksheet from the JSON data
  const worksheet = xlsx.utils.json_to_sheet(outputData);
  // Create a new workbook
  const workbook = xlsx.utils.book_new();
  // Append the worksheet to the workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Report');
  // Write the workbook to a file
  xlsx.writeFile(workbook, `${singleSector}.xlsx`);
  console.log(`Excel file saved as ${singleSector}.xlsx`);
}
