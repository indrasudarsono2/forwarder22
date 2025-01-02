const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { Parser } = require('json2csv');
const fs = require('fs')
dayjs.extend(utc);

const run = async() => {
  const now = dayjs.utc('2024-06-01').startOf('day').toDate();
  const tomorow = dayjs.utc(now).add('90', 'days').toDate();
  const boundry = ['OSRUT', 'ENPIN', 'SUGIK', 'TANUR', 'TAVIP', 'SPIKO', 'RUPKA', 'KALUT', 'MADIN', 'ANY']
  const result = [];
  const sfpi = await prisma.sfpis.findMany({
    where: {
      dateInit: {
        gte: now,
        lt: tomorow,
      },
      AND: [
        {
          OR: [
            { adep: 'WADD' },
            { ades: 'WADD' },
          ],
        },
        {
          NOT: [
            { adep: 'WIII' },
            { ades: 'WIII' },
          ],
        },
      ],
    },
    select: {
      id: true,
      callsign: true,
      adep: true,
      ades: true,
      aircraftReg: true,
      aircraftType: true,
    },
  });
 
  for(let i = 0 ; i < sfpi.length ; i++){
    const logPath = await prisma.logPaths.findFirst({
      where: {
        sfpiId: sfpi[i].id,
        estTimeOfEntry: {
          not: null
        }
      },
      select: {
        paths: true
      },
      orderBy: {
        numWaypoints: 'desc'
      }
    });
    if(logPath==null){
      continue;
    }else{
      if(logPath == true || logPath.paths != null){
        const jsonPath = JSON.parse(logPath.paths);
        if(sfpi[i].ades == 'WADD'){
          for(let j = jsonPath.length - 1 ; j >= 0 ; j--){
            if(boundry.includes(jsonPath[j].pointName)){
              sfpi[i]["BOUNDRY POINT"] = jsonPath[j].pointName
              sfpi[i]["BOUNDRY TIME"] = dayjs.utc(jsonPath[j].time).format('YYYY-MM-DD HH:mm:ss');
              result.push(sfpi[i]);
              break;
            }
          }
        }else{
          for(let j = 0 ; j < jsonPath.length ; j++){
            if(boundry.includes(jsonPath[j].pointName)){
              sfpi[i]["BOUNDRY POINT"] = jsonPath[j].pointName
              sfpi[i]["BOUNDRY TIME"] = dayjs.utc(jsonPath[j].time).format('YYYY-MM-DD HH:mm:ss');
              result.push(sfpi[i]);
              break;
            }
          }
        }
      }
    }
  }
  
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(result); 
  fs.writeFileSync('./bali.csv', csv);
}

run()