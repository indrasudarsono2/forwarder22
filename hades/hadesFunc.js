const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const sector = require('../sector.json');
dayjs.extend(utc);

const hadesFunct = async(from, to) => {
  try {
    const sfpiId = [];
    const allData = [];
    const today = from;
    const tomorow = to;
    // const log = await prisma.logs.findMany({
    //   where: {
    //     time: {
    //       gte: today,
    //       lt: tomorow
    //     },
        
    //   }
    // })
    
    // for(let i in log){
    //   if(!sfpiId.includes(log[i].sfpiId)){
    //     sfpiId.push(log[i].sfpiId)
    //   }
    // }
    const apt = ['WIII', 'WIHH', 'WIRR', 'WILL', 'WICC', 'WICA']
    const sfpi = await prisma.sfpis.findMany({
      where: {
        AND: [
          {
            dateInit: {
              gte: today,
              lt: tomorow
            },
          },
          {
            adep: {
              notIn: apt,
            },
          },
          {
            ades: {
              notIn: apt
            },
          },
          {
            requestedFlightLevel: {
              gte: 245
            }
          }
        ]  
      }
    })
   
    for (let j = 0; j < sfpi.length; j++) {
      const { pathGnerated } = await getPath(sfpi[j].id);
      const fl = await flighLevel(sfpi[j].id);
      const estPoint = pathGnerated !== null ? await Est_point(pathGnerated) : null;
      const sectorResult = pathGnerated !== null ? await sectorGenerator(pathGnerated, sector) : null;
      const { inbound, outbound } = await inAndOut(pathGnerated);
      if(pathGnerated == null || inbound == null || outbound == null){
        continue;
      }else{
        const data = {
          "NO": j + 1,
          "SFPI": sfpi[j].id,
          "TANGGAL": inbound != null ? dayjs.utc(inbound.time).format('YYYY-MM-DD HH:mm:ss') : dayjs.utc(sfpi[j].scheduledTime).format('YYYY-MM-DD HH:mm:ss'),
          "ACID": sfpi[j].callsign,
          "A_REG": sfpi[j].aircraftReg,
          "AC_TYPE": sfpi[j].aircraftType,
          "Flight_Type": sfpi[j].flightType,
          "PBN": sfpi[j].pbnEquip,
          "C_FL": sfpi[j].clearedFlightLevel,
          "R_FL": sfpi[j].requestedFlightLevel,
          "X_FL": sfpi[j].exitFlightLevel,
          "RIU": null,
          "ETD": sfpi[j].departureTime != null ? dayjs.utc(sfpi[j].departureTime).format('HHmm') : null,
          "Tgl_ETD": sfpi[j].departureTime != null ? dayjs.utc(sfpi[j].departureTime).format('DDMMYYYY') : null,
          "ATD": sfpi[j].departureTime != null ? dayjs.utc(sfpi[j].departureTime).format('HHmm') : null,
          "Tgl_ATD": sfpi[j].departureTime != null ? dayjs.utc(sfpi[j].departureTime).format('DDMMYYYY') : null,
          "ATA": sfpi[j].actualLandingTime != null ? dayjs.utc(sfpi[j].actualLandingTime).format('HHmm') : null,
          "ETA": null,
          "Tgl_ATA": sfpi[j].actualLandingTime != null ? dayjs.utc(sfpi[j].actualLandingTime).format('DDMMYYYY') : null,
          "Tgl_ETA": null,
          "ADEP": sfpi[j].adep,
          "ADES": sfpi[j].ades,
          "Route": null,
          "Point_Entry": inbound != null ? inbound.pointName : null,
          "Time_Entry": inbound != null ? dayjs.utc(inbound.time).format('HHmm') : null,
          "Point_Exit": outbound != null ? outbound.pointName : null,
          "Time_Exit": outbound != null ? dayjs.utc(outbound.time).format('HHmm') : null,
          "Sector": sectorResult,
          "Est_point": estPoint,
          "FL_Rec": fl,
          "Tipe_Trav": sfpi[j].travelType,
          "POB": null,
          "Status_data": null,
          "TnG": null,
          "Opr_Info": null,
          "Remark": null,
          "DOF": sfpi[j].departureTime != null ? dayjs.utc(sfpi[j].departureTime).format('YYMMDD') : null,
        };
      
        if (data.Est_point != null) {
          allData.push(data);
        }
      }
    }
    return allData;
  } catch (error) {
    console.log(error)
  }
}

async function getPath(id) {
  /**SEKTOR ABC */
  const unta = sector[0].ACC[12].UNTA
  const utpg = sector[0].ACC[13].UTPG
  const abc = [...unta, ...utpg]
  /** */
  
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
        numWaypoints: "desc"
      }
    })
    if(path){
      var pathGnerated = null;
      var pathGnerated2 = JSON.parse(path.paths);
      for(let path = 0 ; path < pathGnerated2.length ; path++){
        if(abc.includes(pathGnerated2[path].pointName)){
          var pathGnerated = pathGnerated2
          break;
        }
      }
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
  
    for(let k = pathGnerated.length-1 ;k >=0  ; k--){
      if(allValues.includes(pathGnerated[k].pointName)){
        var outbound = pathGnerated[k]
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
      return `${time}-${dataExtract.clearedFlightLevel}`;
    }).join(' ')
  }
}

module.exports = {hadesFunct}