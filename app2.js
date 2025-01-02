const { PrismaClient } = require('@prisma/client');

const fs = require('fs');

const prisma = new PrismaClient();

const read = fs.readFileSync('sfpl5.txt', 'binary');
let fixedJson = read.replace(/}\{/g, '},{');
fixedJson = '[' + fixedJson + ']';

let jsonFile = JSON.parse(fixedJson);
console.log(jsonFile);
// console.log(file.path.length);
// console.log(file.path[0]);
// main();
// async function main(){
//   if(!file.path){
    
//     const check = await prisma.sfpis.findFirst({
//       where: {
//         id: file.fieldsData.sfpi
//       }
//     })

//     if(!check){
//       await prisma.sfpis.create({
//         data:{
//           id: file.fieldsData.sfpi,
//           state: file.fieldsData.state,
//           travelType: file.fieldsData.travelType,
//           flightType: file.fieldsData.flightType,
//           flightRules: file.fieldsData.flightRules,
//           callsign: file.fieldsData.callsign,
//           aircraftReg: file.fieldsData.aircraftReg,
//           aircraftType: file.fieldsData.aircraftType,
//           wakeTurbulance: file.fieldsData.wakeTurbulance,
//           navigationEquip: file.fieldsData.navigationEquip,
//           surveillanceEquip: file.fieldsData.surveillanceEquip,
//           ssrCode: file.fieldsData.ssrCode,
//           estTimeOfEntry: file.fieldsData.estTimeOfEntry,
//           clearedFlightLevel: JSON.stringify(file.fieldsData.clearedFlightLevel),
//           exitFlightLevel: JSON.stringify(file.fieldsData.exitFlightLevel),
//           requestedFlightLevel: JSON.stringify(file.fieldsData.requestedFlightLevel),
//           cruisingSpeed: JSON.stringify(file.fieldsData.cruisingSpeed),
//           adep: file.fieldsData.adep,
//           ades: file.fieldsData.ades,
//           departureTime: file.fieldsData.departureTime,
//           scheduledTime: file.fieldsData.scheduledTime,
//           operatorInfo: file.fieldsData.operatorInfo,
//           terminateMode: file.fieldsData.terminateMode,
//           xflApprovalState: file.fieldsData.xflApprovalState,
//           coordinationState: file.fieldsData. coordinationState,
//           revision: file.fieldsData.revision,
//           operatorInfo2: file.fieldsData.operatorInfo2,
//           assignedSpeed: file.fieldsData.assignedSpeed,
//           assignedHeading: file.fieldsData.assignedHeading,
//           radarIdentification: file.fieldsData.radarIdentification,
//           actualLandingTime: file.fieldsData.actualLandingTime,
//           numAircrafts : JSON.stringify(file.fieldsData.numAircrafts),
//           fuel: file.fieldsData.fuel,
//           specApproach: file.fieldsData.specApproach,
//           alternateSsrCode: file.fieldsData.alternateSsrCode,
//           pbnEquip: file.fieldsData.pbnEquip,
//           fplFormat: file.fieldsData.fplFormat,
//           log: {
//             create: {
//               time: file.time,
//               mod: file.mod,
//               updType: file.updType,
//             }
//           }
//         }
//       })
//     }else{
//       await prisma.sfpis.update({
//         where: {
//           id: file.fieldsData.sfpi, 
//         },
//         data:{
//           state: file.fieldsData.state,
//           travelType: file.fieldsData.travelType,
//           flightType: file.fieldsData.flightType,
//           flightRules: file.fieldsData.flightRules,
//           callsign: file.fieldsData.callsign,
//           aircraftReg: file.fieldsData.aircraftReg,
//           aircraftType: file.fieldsData.aircraftType,
//           wakeTurbulance: file.fieldsData.wakeTurbulance,
//           navigationEquip: file.fieldsData.navigationEquip,
//           surveillanceEquip: file.fieldsData.surveillanceEquip,
//           ssrCode: file.fieldsData.ssrCode,
//           estTimeOfEntry: file.fieldsData.estTimeOfEntry,
//           clearedFlightLevel: JSON.stringify(file.fieldsData.clearedFlightLevel),
//           exitFlightLevel: JSON.stringify(file.fieldsData.exitFlightLevel),
//           requestedFlightLevel: JSON.stringify(file.fieldsData.requestedFlightLevel),
//           cruisingSpeed: JSON.stringify(file.fieldsData.cruisingSpeed),
//           adep: file.fieldsData.adep,
//           ades: file.fieldsData.ades,
//           departureTime: file.fieldsData.departureTime,
//           scheduledTime: file.fieldsData.scheduledTime,
//           operatorInfo: file.fieldsData.operatorInfo,
//           terminateMode: file.fieldsData.terminateMode,
//           xflApprovalState: file.fieldsData.xflApprovalState,
//           coordinationState: file.fieldsData. coordinationState,
//           revision: file.fieldsData.revision,
//           operatorInfo2: file.fieldsData.operatorInfo2,
//           assignedSpeed: file.fieldsData.assignedSpeed,
//           assignedHeading: file.fieldsData.assignedHeading,
//           radarIdentification: file.fieldsData.radarIdentification,
//           actualLandingTime: file.fieldsData.actualLandingTime,
//           numAircrafts : JSON.stringify(file.fieldsData.numAircrafts),
//           fuel: file.fieldsData.fuel,
//           specApproach: file.fieldsData.specApproach,
//           alternateSsrCode: file.fieldsData.alternateSsrCode,
//           pbnEquip: file.fieldsData.pbnEquip,
//           fplFormat: file.fieldsData.fplFormat,
//           log: {
//             create: {
//               time: file.time,
//               mod: file.mod,
//               updType: file.updType,
//               updatedData: {
//                 create: {
//                   data: JSON.stringify(file.updatedData)
//                 }
//               }
//             }
//           }
//         }
//       })
//     }
//   }else{
//     await prisma.sfpis.update({
//       where: {
//         id: file.sfpi, 
//       },
//       data:{
//         log: {
//           create: {
//             time: file.time,
//             mod: file.mod,
//             updType: file.updType,
//             updatedData: {
//               create: {
//                 data: JSON.stringify(file.path)
//               }
//             }
//           }
//         }
//       }
//     })

//     const checkPath = await prisma.paths.findMany({
//       where: {
//         sfpiId: file.sfpi
//       }
//     })
//     // console.log(checkPath[0].id)
//     if(checkPath == ''){
//       console.log('null');
//       for(var i = 0; i < file.path.length ; i++){
//         await prisma.sfpis.update({
//           where: {
//             id: file.sfpi, 
//           },
//           data: {
//             path: {
//               create: {
//                 logTime: file.time,
//                 pointName: file.path[i].pointName,
//                 time: file.path[i].time,
//                 status: file.path[i].status,
//               }
//             }
//           }
//         })
//       }
//     }else{
//       console.log('notnull');
//       await prisma.paths.deleteMany({
//         where: {
//           sfpiId: file.sfpi
//         }
//       })

//       for(var i = 0; i < file.path.length ; i++){
//         await prisma.sfpis.update({
//           where: {
//             id: file.sfpi, 
//           },
//           data: {
//             path: {
//               create: {
//                 logTime: file.time,
//                 pointName: file.path[i].pointName,
//                 time: file.path[i].time,
//                 status: file.path[i].status,
//               }
//             }
//           }
//         })
//       }
//     }
//   }


//   // const find = await prisma.sfpis.findFirst({
//   //   include: {
//   //     log: {
//   //       include: {
//   //         updatedData: true,
//   //       }
//   //     },
//   //     path: true
//   //   }
//   // });
//   // console.log(find.log[3]);
//   //const string = find.log[0].updatedData.data;
//   //const json = JSON.parse(string);

// }
// var sql = "INSERT INTO sfpl_aidc set SFPI = '123'";

// db.query(sql, (err, result) => {
//   if(err) throw err;
//   console.log('1 row inserted');
// })