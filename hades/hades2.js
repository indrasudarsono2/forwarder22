const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const sector = require('../sector.json');
const { Parser } = require('json2csv');
dayjs.extend(utc);

const hades = async (tgl) => {
  const sfpiId = [];
  const allData = [];
  const today = dayjs.utc(`2024-09-${tgl}T00:00:00`).toDate();
  const tomorow = dayjs.utc(today).add(1,'day').toDate();
  // const log = await prisma.logs.findMany({
  //   where: {
  //     time: {
  //       gte: today,
  //       lt: tomorow
  //     }
  //   }
  // })
  
  const log = await prisma.sfpis.findMany({
    where: {
      dateInit:{
        gte: today,
        lt: tomorow
      }
    }
  })

  for(let i in log){
    if(!sfpiId.includes(log[i].id)){
      sfpiId.push(log[i].id)
    }
  }
  
  for(let j = 0 ; j < sfpiId.length ; j++){
    const sfpi = await prisma.sfpis.findFirst({
      where: {
        id: sfpiId[j],
        // id: "15273927"
      }
    })

    const {pathGnerated} = await getPath(sfpi.id);
    const fl = await flighLevel(sfpi.id);
    const estPoint = pathGnerated !== null ? await Est_point(pathGnerated) : null;
    const sectorResult = pathGnerated !== null ? await sectorGenerator(pathGnerated, sector) : null;
    const {inbound, outbound} = await inAndOut(pathGnerated);
    const arrivalTime = await arrival(sfpi.id);
    
    const data = {
      "NO" : j+1,
      "SFPI" : sfpi.id,
      "TANGGAL" : dayjs.utc(today).format('DD/MM/YYYY'),
      "ACID" : sfpi.callsign,
      "A_REG" : sfpi.aircraftReg,
      "AC_TYPE" : sfpi.aircraftType,
      "Flight_Type" : sfpi.flightType,
      "PBN" : sfpi.pbnEquip,
      "C_FL" : sfpi.clearedFlightLevel,
      "R_FL" : sfpi.requestedFlightLevel,
      "X_FL" : sfpi.exitFlightLevel,
      "RIU" : null,
      "ETD" : sfpi.departureTime != null ? dayjs.utc(sfpi.departureTime).format('HHmm') : null,
      "Tgl_ETD" : sfpi.departureTime != null ? dayjs.utc(sfpi.departureTime).format('DDMMYYYY') : null,
      "ATD" : sfpi.departureTime != null ? dayjs.utc(sfpi.departureTime).format('HHmm') : null,
      "Tgl_ATD" : sfpi.departureTime != null ? dayjs.utc(sfpi.departureTime).format('DDMMYYYY') : null,
      "ATA" : sfpi.actualLandingTime != null ? dayjs.utc(sfpi.actualLandingTime).format('HHmm') : null,
      "ETA" : arrivalTime != null ? dayjs.utc(arrivalTime).format('HHmm') : null,
      "Tgl_ATA" : sfpi.actualLandingTime != null ? dayjs.utc(sfpi.actualLandingTime).format('DDMMYYYY') : null,
      "Tgl_ETA" : arrivalTime != null ? dayjs.utc(arrivalTime).format('DDMMYYYY') : null,
      "ADEP" : sfpi.adep,
      "ADES" : sfpi.ades,
      "Route" : null,
      "Point_Entry" : inbound != null ? inbound.pointName : null,
      "Time_Entry" : inbound != null ? dayjs.utc(inbound.time).format('HHmm') : null,
      "Point_Exit" : outbound != null ? outbound.pointName : null,
      "Time_Exit" : outbound != null ? dayjs.utc(outbound.time).format('HHmm') : null,
      "Sector" : sectorResult,
      "Est_point" : estPoint,
      "FL_Rec" : fl,
      "Tipe_Trav" : sfpi.travelType,
      "POB" : null,
      "Status_data" : null,
      "TnG" : null,
      "Opr_Info" : null,
      "Remark" : null,
      "DOF" : sfpi.departureTime != null ? dayjs.utc(sfpi.departureTime).format('YYMMDD') : null,
    }

    if(data.Est_point != null){
      allData.push(data);
    }
  }

  // const datas = JSON.stringify(allData, 1, 1);
  // const json2csvParser = new Parser();
  // const csv = json2csvParser.parse(allData);
  // fs.writeFileSync(`/home/centos/PROGRAM/hades/log_${dayjs.utc(today).format('YYMMDD')}.csv`, csv);
  return {allData}
  // fs.writeFileSync('./hades.txt', datas);
  // fs.writeFileSync('./hades240624.csv', csv);
}

const run = async () => {
 var tsd = []
  for (let i = 1 ; i <=30 ; i++){
		const tgl = i < 10 ? `0${i}` : i;
    // await hades(tgl)
		const {allData} = await hades(tgl);
    var tsd = [...tsd, ...allData]
	}
 
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(tsd);
  fs.writeFileSync('./SEPTEMBER2024.csv', csv);
  // fs.writeFileSync(`/home/centos/PROGRAM/hades/log_${dayjs.utc(today).format('YYMMDD')}.csv`, csv);
}

run();

async function getPath(id) {
  const logs = await prisma.logs.findFirst({
    where: {
      sfpiId: id,
      data: {
        contains: "ACTIVE"
      },
    },
    orderBy: {
      time: 'asc'
    }
  });

  if(logs){
    const path = await prisma.logPaths.findFirst({
      where: {
        sfpiId : id,
        time: {
          gte: dayjs.utc(logs.time).toDate(),
        },
        paths: {
          not: {
            contains: "null"
          },
          contains: "Flown"
        }
      },
      orderBy: {
        id: "asc"
      }
    })
    if(path){
      var pathGnerated = JSON.parse(path.paths);
    }else{
      var pathGnerated = null;
    }
  }else{
    var pathGnerated = null;
  }
  return {pathGnerated};
}

async function Est_point(pathGnerated){
  return pathGnerated.map(point => {
    const formattedTime = dayjs(point.time).format('HHmm');
    return `${point.pointName}/${formattedTime}`;
  }).join(' ')
}

async function sectorGenerator(pathGnerated, sector){
  const acc = sector[0]["ACC"];
  const app = sector[1]["APP"];
  const sectorSelected = [...acc, ...app]
 
  // Create a mapping of points to sectors
  const pointToSectorMap = {};
  sectorSelected.forEach(sec => {
    const [sectorName, points] = Object.entries(sec)[0];
    points.forEach(point => {
      pointToSectorMap[point] = sectorName;
    });
  });

  // Collect unique sector names from the path
  const sectorNames = new Set();
  pathGnerated.forEach(point => {
    const sectorName = pointToSectorMap[point.pointName];
    if (sectorName) {
      sectorNames.add(sectorName);
    }
  });

  // Convert the set to an array and join the elements into a string
  const result = Array.from(sectorNames).join(' ');
  return result
}

async function inAndOut(pathGnerated) {
  if(pathGnerated !== null){
    const acc = sector[0]["ACC"];
    const app = sector[1]["APP"];
    const sectorSelected = [...acc, ...app];
    
    // Collecting all values into a single array
    const allValues = sectorSelected.flatMap(Object.values).flat();
    
    for(let i = 0 ; i < pathGnerated.length ; i++){
      if(allValues.includes(pathGnerated[i].pointName)){
        var inbound = pathGnerated[i]
        break;
      }
    }
  
    for(let j = pathGnerated.length-1 ;j >=0  ; j--){
      if(allValues.includes(pathGnerated[j].pointName)){
        var outbound = pathGnerated[j]
        break;
      }
    }
  }else{
    var inbound = null;
    var outbound = null;
  }

  return {inbound, outbound}
}

async function flighLevel(id) {
  const logs = await prisma.logs.findMany({
    where: {
      sfpiId: id,
      data: {
        contains: "clearedFlightLevel"
      }
    }
  })
  if(logs){
    return logs.map(data => {
      const time = dayjs.utc(data.time).format('HHmm');
      const dataExtract = JSON.parse(data.data);
      return `${dataExtract.clearedFlightLevel}`;
      // return `${time}-${dataExtract.clearedFlightLevel}`;
    }).join(' ')
  }
}

async function arrival(id){
  const logPath = await prisma.logPaths.findFirst({
    where: {
      sfpiId: id,
      NOT: {
        arrivalTime: null
      }
    },
    orderBy: {
      estTimeOfEntry: 'desc'
    }
  });
  if(logPath){
    return logPath.arrivalTime; 
  }else{
    return null;
  }

}
