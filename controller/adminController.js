// let file = [];
// let fileMaster = [];
// let errorFile = [];
// let errorMessage = [];

module.exports = {
  push: (req, res) => {
    try {
      let singleFile = request.body;
      fileMaster.push(singleFile);
      console.log('PUSH');
    } catch (error) {
      res.error
    }
  },

  errorFile: (req, res) => {
    res.json(errorFile);
  },

  errorMessage: (req, res) => {
    res.json(errorMessage);
  },

  fileMaster: (req, res) => {
    res.json(file)
  }
}

// setInterval(async() => {
//     if (fileMaster.length > 0) {
//       file = fileMaster;
  
//       if(file.length > 0){
//         fileMaster = [];
  
//         for(var j = 0 ; j <= file.length ; j++){
        
//           console.log(`FILE yang ke ${j} dari ${file.length}`)
          
//           if(j == file.length){
//             file = [];
//             break;
//           }
          
//           if(!file[j].path){
//             if(file[j].fieldsData.estTimeOfEntry == 'Unknown'){
//               file[j].fieldsData.estTimeOfEntry = '1970-01-01 00:00:00'
//             }
//             if(file[j].fieldsData.departureTime == 'Unknown'){
//               file[j].fieldsData.departureTime = '1970-01-01 00:00:00'
//             }
//             if(file[j].fieldsData.scheduledTime == 'Unknown'){
//               file[j].fieldsData.scheduledTime = '1970-01-01 00:00:00'
//             }
//             if(file[j].fieldsData.actualLandingTime == 'Unknown'){
//               file[j].fieldsData.actualLandingTime = '1970-01-01 00:00:00'
//             }
    
//             const check = await prisma.sfpis.findFirst({
//               where: {
//                 id: file[j].fieldsData.sfpi
//               }
//             })
        
//             if(!check){
//               await prisma.sfpis.create({
//                 data:{
//                   id: file[j].fieldsData.sfpi,
//                   state: file[j].fieldsData.state,
//                   travelType: file[j].fieldsData.travelType,
//                   flightType: file[j].fieldsData.flightType,
//                   flightRules: file[j].fieldsData.flightRules,
//                   callsign: file[j].fieldsData.callsign,
//                   aircraftReg: file[j].fieldsData.aircraftReg,
//                   aircraftType: file[j].fieldsData.aircraftType,
//                   wakeTurbulance: file[j].fieldsData.wakeTurbulance,
//                   navigationEquip: file[j].fieldsData.navigationEquip,
//                   surveillanceEquip: file[j].fieldsData.surveillanceEquip,
//                   ssrCode: file[j].fieldsData.ssrCode,
//                   estTimeOfEntry: new Date(new Date(file[j].fieldsData.estTimeOfEntry).getTime() - new Date().getTimezoneOffset() * 60000),
//                   clearedFlightLevel: file[j].fieldsData.clearedFlightLevel,
//                   exitFlightLevel: file[j].fieldsData.exitFlightLevel,
//                   requestedFlightLevel: file[j].fieldsData.requestedFlightLevel,
//                   cruisingSpeed: file[j].fieldsData.cruisingSpeed,
//                   adep: file[j].fieldsData.adep,
//                   ades: file[j].fieldsData.ades,
//                   departureTime: new Date(new Date(file[j].fieldsData.departureTime).getTime() - new Date().getTimezoneOffset() * 60000),
//                   scheduledTime: new Date(new Date(file[j].fieldsData.scheduledTime).getTime() - new Date().getTimezoneOffset() * 60000),
//                   operatorInfo: file[j].fieldsData.operatorInfo,
//                   terminateMode: file[j].fieldsData.terminateMode,
//                   xflApprovalState: file[j].fieldsData.xflApprovalState,
//                   coordinationState: file[j].fieldsData. coordinationState,
//                   revision: file[j].fieldsData.revision,
//                   operatorInfo2: file[j].fieldsData.operatorInfo2,
//                   assignedSpeed: file[j].fieldsData.assignedSpeed,
//                   assignedHeading: file[j].fieldsData.assignedHeading,
//                   radarIdentification: file[j].fieldsData.radarIdentification,
//                   actualLandingTime: new Date(new Date(file[j].fieldsData.actualLandingTime).getTime() - new Date().getTimezoneOffset() * 60000),
//                   numAircrafts : file[j].fieldsData.numAircrafts,
//                   fuel: file[j].fieldsData.fuel,
//                   specApproach: file[j].fieldsData.specApproach,
//                   alternateSsrCode: file[j].fieldsData.alternateSsrCode,
//                   pbnEquip: file[j].fieldsData.pbnEquip,
//                   fplFormat: file[j].fieldsData.fplFormat,
//                   log: {
//                     create: {
//                       time: new Date(new Date(file[j].time).getTime() - new Date().getTimezoneOffset() * 60000),
//                       mod: file[j].mod,
//                       updType: file[j].updType,
//                       data: JSON.stringify(file[j].updatedData)
//                     }
//                   }
//                 }
//               })
//             }else{
//               await prisma.sfpis.update({
//                 where: {
//                   id: file[j].fieldsData.sfpi, 
//                 },
//                 data:{
//                   state: file[j].fieldsData.state,
//                   travelType: file[j].fieldsData.travelType,
//                   flightType: file[j].fieldsData.flightType,
//                   flightRules: file[j].fieldsData.flightRules,
//                   callsign: file[j].fieldsData.callsign,
//                   aircraftReg: file[j].fieldsData.aircraftReg,
//                   aircraftType: file[j].fieldsData.aircraftType,
//                   wakeTurbulance: file[j].fieldsData.wakeTurbulance,
//                   navigationEquip: file[j].fieldsData.navigationEquip,
//                   surveillanceEquip: file[j].fieldsData.surveillanceEquip,
//                   ssrCode: file[j].fieldsData.ssrCode,
//                   estTimeOfEntry: new Date(new Date(file[j].fieldsData.estTimeOfEntry).getTime() - new Date().getTimezoneOffset() * 60000),
//                   clearedFlightLevel: file[j].fieldsData.clearedFlightLevel,
//                   exitFlightLevel: file[j].fieldsData.exitFlightLevel,
//                   requestedFlightLevel: file[j].fieldsData.requestedFlightLevel,
//                   cruisingSpeed: file[j].fieldsData.cruisingSpeed,
//                   adep: file[j].fieldsData.adep,
//                   ades: file[j].fieldsData.ades,
//                   departureTime: new Date(new Date(file[j].fieldsData.departureTime).getTime() - new Date().getTimezoneOffset() * 60000),
//                   scheduledTime: new Date(new Date(file[j].fieldsData.scheduledTime).getTime() - new Date().getTimezoneOffset() * 60000),
//                   operatorInfo: file[j].fieldsData.operatorInfo,
//                   terminateMode: file[j].fieldsData.terminateMode,
//                   xflApprovalState: file[j].fieldsData.xflApprovalState,
//                   coordinationState: file[j].fieldsData. coordinationState,
//                   revision: file[j].fieldsData.revision,
//                   operatorInfo2: file[j].fieldsData.operatorInfo2,
//                   assignedSpeed: file[j].fieldsData.assignedSpeed,
//                   assignedHeading: file[j].fieldsData.assignedHeading,
//                   radarIdentification: file[j].fieldsData.radarIdentification,
//                   actualLandingTime: new Date(new Date(file[j].fieldsData.actualLandingTime).getTime() - new Date().getTimezoneOffset() * 60000),
//                   numAircrafts : file[j].fieldsData.numAircrafts,
//                   fuel: file[j].fieldsData.fuel,
//                   specApproach: file[j].fieldsData.specApproach,
//                   alternateSsrCode: file[j].fieldsData.alternateSsrCode,
//                   pbnEquip: file[j].fieldsData.pbnEquip,
//                   fplFormat: file[j].fieldsData.fplFormat,
//                   log: {
//                     create: {
//                       time: new Date(new Date(file[j].time).getTime() - new Date().getTimezoneOffset() * 60000),
//                       mod: file[j].mod,
//                       updType: file[j].updType,
//                       data: JSON.stringify(file[j].updatedData)
//                     }
//                   }
//                 }
//               })
//             }
//           }else{
//             const checkSfpi = await prisma.sfpis.findFirst({
//               where: {
//                 id: file[j].sfpi
//               }
//             })
    
//             if(checkSfpi){
//               await prisma.sfpis.update({
//                 where: {
//                   id: file[j].sfpi, 
//                 },
//                 data:{
//                   log: {
//                     create: {
//                       time: new Date(new Date(file[j].time).getTime() - new Date().getTimezoneOffset() * 60000),
//                       mod: file[j].mod,
//                       updType: file[j].updType,
//                       data: JSON.stringify(file[j].path)
//                     }
//                   }
//                 }
//               })
          
//               const checkPath = await prisma.paths.findMany({
//                 where: {
//                   sfpiId: file[j].sfpi
//                 }
//               })
//               // console.log(checkPath[0].id)
//               if(checkPath == ''){
//                 // console.log('null');
//                 for(var i = 0; i < file[j].path.length ; i++){
//                   await prisma.sfpis.update({
//                     where: {
//                       id: file[j].sfpi, 
//                     },
//                     data: {
//                       path: {
//                         create: {
//                           logTime: new Date(new Date(file[j].time).getTime() - new Date().getTimezoneOffset() * 60000),
//                           pointName: file[j].path[i].pointName,
//                           time: new Date(new Date(file[j].path[i].time).getTime() - new Date().getTimezoneOffset() * 60000),
//                           status: file[j].path[i].status,
//                         }
//                       }
//                     }
//                   })
//                 }
//               }else{
//                 // console.log('notnull');
//                 await prisma.paths.deleteMany({
//                   where: {
//                     sfpiId: file[j].sfpi
//                   }
//                 })
          
//                 for(var i = 0; i < file[j].path.length ; i++){
//                   await prisma.sfpis.update({
//                     where: {
//                       id: file[j].sfpi, 
//                     },
//                     data: {
//                       path: {
//                         create: {
//                           logTime: new Date(new Date(file[j].time).getTime() - new Date().getTimezoneOffset() * 60000),
//                           pointName: file[j].path[i].pointName,
//                           time: new Date(new Date(file[j].path[i].time).getTime() - new Date().getTimezoneOffset() * 60000),
//                           status: file[j].path[i].status,
//                         }
//                       }
//                     }
//                   })
//                 }
//               }
//             }
//           }
//         }
//       }else{
//         console.log("No file received");
//       }
//     } else {
//       console.log("No file master received.");
//     }
//   }, 120000);