const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { Parser } = require('json2csv');
const fs = require('fs')
dayjs.extend(utc);

const run = async () => {
  const takeoffData = []
  const landingData = []
  const takeoff= await prisma.sfpis.findMany({
    where: {
      AND: [
        {
          adep: 'WIII'
        },   
        {
          estTimeOfEntry: {
            gte: '2024-06-01T14:00:00Z',
            lte:  '2024-08-31T17:00:00Z'
         }
        },
      ]    
    },
    select: {
      callsign: true,
      adep: true,
      ades: true,
      estTimeOfEntry: true,
    }
  })
  
  const landing = await prisma.sfpis.findMany({
    where: {
      AND: [
        {
          ades: 'WIII'
        },   
        {
          actualLandingTime: {
            gte: '2024-06-01T14:00:00Z',
            lte:  '2024-08-31T17:00:00Z'
         }
        },
      ]    
    },
    select: {
      callsign: true,
      adep: true,
      ades: true,
      actualLandingTime: true,
    }
  })

  for(let i = 0 ; i < takeoff.length ; i++){
    const isSunday = dayjs.utc(takeoff[i].estTimeOfEntry).day() == 0 ? true : false;
    const date = dayjs.utc(takeoff[i].estTimeOfEntry).format('YYYY-MM-DD')
    const selectedHour = dayjs.utc(takeoff[i].estTimeOfEntry).toDate() >= dayjs.utc(`${date}T14:00:00Z`).toDate()
                          && dayjs.utc(takeoff[i].estTimeOfEntry).toDate() <= dayjs.utc(`${date}T17:00:00Z`).toDate() ?
                          true : false;
    if(isSunday && selectedHour){
      takeoffData.push(takeoff[i])
    }
  }

  for(let j = 0 ; j < landing.length ; j++){
    const isSunday = dayjs.utc(landing[j].actualLandingTime).day() == 0 ? true : false;
    const date = dayjs.utc(landing[j].actualLandingTime).format('YYYY-MM-DD')
    const selectedHour = dayjs.utc(landing[j].actualLandingTime).toDate() >= dayjs.utc(`${date}T14:00:00Z`).toDate()
                          && dayjs.utc(landing[j].actualLandingTime).toDate() <= dayjs.utc(`${date}T17:00:00Z`).toDate() ?
                          true : false;
    if(isSunday && selectedHour){
      landingData.push(landing[j])
    }  
  }
  
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(takeoffData); 
  fs.writeFileSync('./takeoff.csv', csv);

}

run()