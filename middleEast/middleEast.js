const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const middleEast = async()=> {
  const now = dayjs.utc('2024-11-01').startOf('day').toDate();
  const tomorow = dayjs.utc(now).add(1, 'month').toDate();
  const aerodromeMidEast = ["O???", "VO??", "VC??"];
  const aerodromeEast = ["WA??", "Y???", "N???"];
  const pointWest = ["NISOK", "NIXUL", "TOPIN", "MEMAK", "ANSAX"];
  const pointEast = ["OSRUT", "ENPIN", "SUGIK", "TANUR", "TAVIP", "RUPKA"];
  const mixPoint = [...pointWest, ...pointEast];
  const mixAerodrome = [...aerodromeMidEast, ...aerodromeEast];

  const regexTest = new RegExp(aerodromeMidEast.join('|').replace(/\?/g, '.'));
  const sfpiId = [] ;
  const takeData = [];
	
  const logPath = await prisma.logPaths.findMany({
    where: {
      time: {
        gte: now,
        lt: tomorow
      },
      OR: mixPoint.map((point) => ({
        paths: {
          contains: point
        },
      })),
    },
    select: {
      sfpiId: true
    }
  })

  for(let i in logPath){
    if(!sfpiId.includes(logPath[i].sfpiId)){
      sfpiId.push(logPath[i].sfpiId);
    }
  }

  const sfpi = await prisma.sfpis.findMany({
    where: {
      id: {
        in: sfpiId
      }
    },
    select: {
      callsign: true,
      aircraftReg: true,
      aircraftType: true,
      adep: true,
      ades: true,
			requestedFlightLevel: true,
      route:true,
      logPath: {
        orderBy: [
					{
						numWaypoints: 'desc',
					},
					{
						time: 'desc'
					},
				],
        take: 1
      }
    }
  })

  for (let j in sfpi){
    const aerodromeTest = new RegExp(mixAerodrome.join('|').replace(/\?/g, '.'))
		if(aerodromeTest.test(sfpi[j].adep) && aerodromeTest.test(sfpi[j].ades)){
      const path = JSON.parse(sfpi[j].logPath[0].paths);
      
      sfpi[j]["pointIn"] = path[0].pointName;
      sfpi[j]["timeIn"] = path[0].time;
      sfpi[j]["pointOut"] = path[path.length - 1].pointName;
      sfpi[j]["timeOut"] = path[path.length - 1].time;
      delete sfpi[j].logPath;
			takeData.push(sfpi[j]);
		}
  }
  const string = JSON.stringify(takeData, 0, 1, 1);
  fs.writeFileSync('./midEast1.json', string);
}

middleEast()