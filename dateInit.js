// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const dayjs = require('dayjs')
// const utc = require('dayjs/plugin/utc');
// const sector = require('./sectorBoundry.json');
const { exec } = require('child_process');
// dayjs.extend(utc);

/**DATE INIIIIIIIIIIIIIIIT */
// const sectorAcc = [];
// sector[0].ACC.forEach(obj => {
//   Object.values(obj).forEach(result => {
//     sectorAcc.push(...result)
//   })
// })

// const sectorApp = [];
// sector[1].APP.forEach(obj => {
//   Object.values(obj).forEach(result => {
//     sectorApp.push(...result);
//   })
// })

// // const dateInitFunc = async (day, month) => {
// //   const date = day < 10 ? `0${day}` : `${day}`
// //   const monthUsed = month < 10 ? `0${month}` : `${month}`
// //   const now = dayjs.utc(`2024-${monthUsed}-${date}`).startOf('day').toDate();
// //   const tomorow = dayjs.utc(now).add(1, 'day').toDate();
// //   // console.log(now);
// //   const log = await prisma.logs.findMany({
// //     where : {
// //       time: {
// //         gte: now,
// //         lt: tomorow
// //       },
// //       updType: {
// //         not: "New System Flight Plan inserted"
// //       },
// //       data: {
// //         contains: "TERMINATED"
// //       } 
// //     },
// //     select: {
// //       sfpiId:true,
// //       time: true,
// //       updType: true,
// //       data: true
// //     }
// //   })
  
// //   let no = 1;
// //   for(let i in log){
// //     const update = await prisma.sfpis.update({
// //       where: {
// //         id: log[i].sfpiId
// //       },
// //       data: {
// //         dateInit: dayjs.utc(log[i].time).toDate()
// //       }
// //     })
// //     console.log(`${dayjs.utc(log[i].time).format("YYYY-MM-DD HH:mm:ss")}: ${update.id} data ke ${no} dari ${log.length}`)
// //     no++
// //   }
// // }

// const dateProcessFunction = async(day, month, year) => {
//   const date = day < 10 ? `0${day}` : `${day}`
//   const monthUsed = month < 10 ? `0${month}` : `${month}`
//   const now = dayjs.utc(`${year}-${monthUsed}-${date}`).startOf('day').toDate();
//   const tomorow = dayjs.utc(now).add(1, 'day').toDate();

//   const sfpi = await prisma.sfpis.findMany({
//     where: {
//       dateInit: {
//         gte: now,
//         lt: tomorow
//       },
//       estTimeOfEntry: {
//         not: null
//       }
//       // OR: [
//       //   {adep: 'WIII'},
//       //   {ades: 'WIII'}
//       // ]
//     },
//     include: {
//       logPath: {
//         where: {
//           estTimeOfEntry : {
//             not: null
//           },
//           paths: {
//             not: null
//           }
//         },
//         orderBy: 
//           [
//             {numWaypoints: 'desc'},
//             {id: 'desc'}
//           ]
//         ,
//         take: 1
//       }
//     }
//   })
//   let no = 1

//   if(sfpi.length != 0){
//     for(let i in sfpi){
//       if(sfpi[i].adep != null && sfpi[i].ades != null){
//         if(sfpi[i].adep == 'WIII'){
//           if(sfpi[i].departureTime != null){
//             await prisma.sfpis.update({
//               where: {
//                 id: sfpi[i].id
//               },
//               data: {
//                 dateProcess: dayjs.utc(sfpi[i].departureTime).toDate()
//               }
//             });
//             console.log(`DEP ${dayjs.utc(sfpi[i].departureTime).format("YYYY-MM-DD HH:mm:ss")}: ${sfpi[i].id} data ke ${no} dari ${sfpi.length}`)           
//           }
//         }else if(sfpi[i].ades == 'WIII'){
//           if(sfpi[i].actualLandingTime != null){
//             await prisma.sfpis.update({
//               where: {
//                 id: sfpi[i].id
//               },
//               data: {
//                 dateProcess: dayjs.utc(sfpi[i].actualLandingTime).toDate()
//               }
//             });
//             console.log(`ARR ${dayjs.utc(sfpi[i].actualLandingTime).format("YYYY-MM-DD HH:mm:ss")}: ${sfpi[i].id} data ke ${no} dari ${sfpi.length}`)
//           }
//         }else if(!sfpi[i].adep.startsWith('WI') && !sfpi[i].adep.startsWith('WA') && !sfpi[i].ades.startsWith('WI') && !sfpi[i].ades.startsWith('WA')){
//           inputDatabase(sfpi[i], 'OVF', sfpi.length, no)
//         }else if((sfpi[i].adep.startsWith('WI') || sfpi[i].adep.startsWith('WA')) && sfpi[i].ades != 'WIII' && sfpi[i].adep != 'WIII' && sfpi[i].ades != 'ZZZZ' && !sfpi[i].ades.startsWith('WI') && !sfpi[i].ades.startsWith('WA')){
//           inputDatabase(sfpi[i], 'OVF INT', sfpi.length, no)
//         }else if((sfpi[i].adep.startsWith('WI') || sfpi[i].adep.startsWith('WA')) && (sfpi[i].ades.startsWith('WI') || sfpi[i].ades.startsWith('WA')) && sfpi[i].ades != 'WIII' && sfpi[i].adep != 'WIII'){
//           inputDatabase(sfpi[i], 'OVF DOM', sfpi.length, no)
//         }
//       }
//       no++
//     }
//   }
// }

// const run = async () => {
//   for(let year = 2023 ; year <= 2024 ; year++){
//     for(let month = 1 ; month <= 12 ; month++){
//       for(let day = 1; day <= 31 ; day++){
//         await dateProcessFunction(day, month, year);   
//       }
//     }
//   }

//   // After all loops are completed, stop PM2
//   exec('pm2 stop 6', (error, stdout, stderr) => {
//     if (error) {
//       console.error('Failed to stop PM2 process with ID 1:', error);
//       return;
//     }

//     if (stderr) {
//       console.error('Error stopping PM2 process with ID 1:', stderr);
//       return;
//     }

//     console.log('PM2 process with ID 1 has been stopped successfully.');
//     console.log(stdout);
//   });
// }

// run()

// async function inputDatabase(sfpi, category, length, no) {
//   if(sfpi.logPath.length != 0){
//     const path = JSON.parse(sfpi.logPath[0].paths);
//     const poinIn = (path, dir) => {
//       if(dir == 'in'){
//         for(let j = 0 ;j < path.length ; j++){
//           if(sectorAcc.includes(path[j].pointName)){
//             return path[j];
//           }
//         }
//       }else{
//         for(let k = path.length-1 ; k >= 0 ; k--){
//           if(sectorAcc.includes(path[k].pointName)){
//             return path[k];
//           }
//         }
//       }
//     }
//     const entry = poinIn(path, 'in');
//     const exit = poinIn(path, 'out');
//     if(entry || exit){
//       await prisma.sfpis.update({
//         where: {
//           id: sfpi.id
//         },
//         data: {
//           dateProcess: dayjs.utc(entry.time).toDate(),
//           pointEntry: entry.pointName,
//           pointExit: exit.pointName,
//           cat: category
//         }
//       });
//       console.log(`${category} ${dayjs.utc(entry.time).format("YYYY-MM-DD HH:mm:ss")}: ${sfpi.id} data ke ${no} dari ${length}`)
//     }
//   }
// }


/**HADEEEESSSSSSSSSSSSSSSSSSSSSS */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const sector = require('./sector.json');
const { Parser } = require('json2csv');
dayjs.extend(utc);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const hades = async () => {
  const today = dayjs.utc(`2024-10-01T00:00:00`).toDate();
  const tomorow = dayjs.utc(today).add(2, 'months').toDate();
  const sfpiId = [];
  // const allSfpi = [];
  const allData= [];
  const log = await prisma.logs.findMany({
    where: {
      time: {
        gte: today,
        lt: tomorow
      }
    },
    select: {
      sfpiId: true
    }
  });
  
  for(let i in log){
    if(!sfpiId.includes(log[i].sfpiId)){
      sfpiId.push(log[i].sfpiId)
    }
  }
  let no = 1
  for(let j = 0 ; j < sfpiId.length ; j++){
    // if(j == 200){
    //   break;
    // }

    const sfpi = await prisma.sfpis.findFirst({
      where: {
        id: sfpiId[j],
        // aircraftReg: null,
        // fplFormat: 'BOTH',
        // OR:[
        //   {ssrCode: {
        //     not: null
        //   }},{
        //     ssrCode: 'Not Assigned'
        //   }
        // ]
      },
      include: {
        log: {
          where: {
            OR: [
              {updType: "New System Flight Plan inserted"},
              {updType: "System Flight Plan updated"}
            ]
          },
          orderBy: {
            time: 'asc'
          },
          select: {
            time: true,
            updType: true,
            mod: true,
            data: true
          }
        }
      }
    })
    if(sfpi){
      // allSfpi.push(sfpi);
      const {pathGnerated} = await getPath(sfpi.id);
      const fl = await flighLevel(sfpi.id);
      const estPoint = pathGnerated !== null ? await Est_point(pathGnerated) : null;
      const sectorResult = pathGnerated !== null ? await sectorGenerator(pathGnerated, sector) : null;
      const {inbound, outbound} = await inAndOut(pathGnerated);
      const arrivalTime = await arrival(sfpi.id);
      const isManual = sfpi.fplFormat == 'BOTH' && sfpi.aircraftReg == null && (sfpi.ssrCode != null || sfpi.ssrCode == 'Not Assigned') ? true : false;
      var clientInputSqawk = null;
      
      for(let c = 0 ; c < sfpi.log.length ; c++){
        if(sfpi.log[c].data != null){
          const json = JSON.parse(sfpi.log[c].data);
          if (json.state != null && isManual == true && json.state == "WAITING"){
            var clientInputSqawk = sfpi.log[c].mod;
            break;
          }
        }
      }

      const lastLog = await prisma.logs.findFirst({
        where: {
          sfpiId: sfpi.id
        },
        orderBy: {
          id: 'desc'
        }
      });

      const data = {
        "NO" : no,
        "SFPI" : sfpi.id,
        "TANGGAL" : dayjs.utc(lastLog.time).format('DD/MM/YYYY'),
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
        "isManual" : isManual,
        "clientInputSqawk" : clientInputSqawk
      }

      // if(data.Est_point != null){
        // if(sfpi){
          // allData.push(sfpi);
          allData.push(data);
        // }
        no++;
      // }
    }
  }

  // const datas = JSON.stringify(allData, 1, 1);
  // const json2csvParser = new Parser();
  // const csv = json2csvParser.parse(allData);
  // fs.writeFileSync(`/home/centos/PROGRAM/hades/log_${dayjs.utc(today).format('YYMMDD')}.csv`, csv);
  // return {allData}
  

  // const string = JSON.stringify(allData, 1, 1);
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(allData);
  // fs.writeFileSync(`/home/centos/PROGRAM/hades/log_${dayjs.utc(today).format('YYMMDD')}.csv`, csv);
  fs.writeFileSync('/home/centos/PROGRAM/forwarder/hades/OKT_NOV.csv', csv)

  exec('pm2 stop 6', (error, stdout, stderr) => {
    if (error) {
      console.error('Failed to stop PM2 process with ID 1:', error);
      return;
    }

    if (stderr) {
      console.error('Error stopping PM2 process with ID 1:', stderr);
      return;
    }

    console.log('PM2 process with ID 1 has been stopped successfully.');
    console.log(stdout);
  });

}

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
        // paths: {
        //   not: {
        //     contains: "null"
        //   },
        //   contains: "Flown"
        // }
      },
      orderBy: [
        {
          numWaypoints: "desc"
        },{
          id: "desc"
        }
      ]
        
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

hades ();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const dayjs = require('dayjs');
// const utc = require('dayjs/plugin/utc');
// dayjs.extend(utc);

// const pprp = async() => {
//   const start = dayjs.utc('2024-10-10 00:00:00').toDate();
//   const end = dayjs.utc('2024-11-06 00:00:00').toDate();
 
//   const sfpi = await prisma.sfpis.findMany({
//     where: {
//       estTimeOfEntry: {
//         gte: start,
//         lt: end
//       }
//     },
//     select: {
//       id: true,
//       departureTime: true,
//       callsign: true,
//       adep: true,
//       ades: true
//     }
//   })

//   for (let i in sfpi){
//     const callsign = sfpi[i].callsign;
//     const dep = dayjs.utc(sfpi[i].departureTime).format('YYYY-MM-DD');
//     const adep = sfpi[i].adep;
//     const ades = sfpi[i].ades;

//     const names = `${callsign}_${dep}${adep}${ades}`
//     await prisma.sfpis.update({
//       where: {
//         id: sfpi[i].id
//       },
//       data: {
//         idForPprp: names
//       }
//     })
//   }
// }

// pprp()