// const fs = require('fs/promises');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { exec } = require('child_process');
const { readData } = require('./sector')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

async function processFile() {
  for(let month = 11 ; month <=11 ; month++){
    const monthFinal = month < 10 ? `0${month}` : month;
    for (let day = 12; day <= 13; day++) {
      // if(month === 1 && day < 3){
      //   continue;
      // }else{
        const x = day % 2;
        if(x === 0){
          const dayLight = day < 10 ? `0${day}` : day;
          const fileSfpl = `sfpl_2024${monthFinal}_${dayLight}`;
          try {
            const dataSfpl = await readFile(fileSfpl, monthFinal);
            await parseSfplMain(dataSfpl, fileSfpl);
            await readData(dataSfpl, fileSfpl);
          } catch (error) {
            if (error.code === 'ENOENT') {
              console.log(`File not found: ${fileSfpl}`);
              continue;
            } else {
              console.error(`An error occurred while reading ${fileSfpl}:`, error);
            }
          }
        }
      // }
    }
  }

  // After all loops are completed, stop PM2
  exec('pm2 stop 1', (error, stdout, stderr) => {
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

// async function readFile(fileSfpl) {
//   return fs.readFile(`./01/${fileSfpl}.log`, 'utf8');
// }

async function readFile(fileSfpl, monthFinal) {
  return new Promise((resolve, reject) => {
    // const filePath = `../sfpl/2023/${monthFinal}/${fileSfpl}.log`;
    const filePath = `../sfpl/${fileSfpl}.log`;
    const readStream = fs.createReadStream(filePath, 'utf8');
    let data = '';

    readStream.on('data', (chunk) => {
      data += chunk;
    });

    readStream.on('end', () => {
      resolve(data);
    });

    readStream.on('error', (error) => {
      reject(error);
    });
  });
}

async function parseSfplMain(dataSfpl, fileSfpl) {
  const regexMatch = /^\d{4}-.*: ?\w* System Flight.*:(?:\n.*?)*(?=^\d{4}-.* \w+:|$)/gm;
  const regHeader = /(?<time>.*) (?<mod>\w*): (?<updType>[\w| ]*):/;
  const regexField = /^\s*(?<field>[\w|.]+ ?\w* \w* \w* \w*)\s*= (?<val>.*)/gm;
  const regupdateCahr = /-->/gm;
  const regOldNew = /(?<old>.*?) --> (?<new>.*)/gm;
  const regexFlightPath = /^\s*(?<pointName>\w*) \((?<est>Unknown|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\) ?(?<typ>\w*)( --> \((?<newEst>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\) (?<newTyp>\w*))?/gm
  
  // const regField = /^\s*(?<field>[\w|.]+( \w+)*)\s+=\s(?<val>(\d+-\d+-\d+ \d+:\d+:\d+)|\w+( [\w|/]+)*|)( --> )?(?<newVal>(\d+-\d+-\d+ \d+:\d+:\d+)|\w+( [\w|/]+)*|)$/gm
  // const regSfpi = /SFPI\s+=\s+(?<sfpi>\d+)/
  // const regPath = /^\s*(?<pointName>\w{2,5})\s\((?<val>.*?)\)\s(?<typ>\w*)( --> \((?<newVal>.*?)\)\s(?<newTyp>\w*))?/gm
  
  const negatives = ['Unknown', 'unknown', 'Not Assigned', 'Calculate Estimates']
  const numFields = ['sfpi', 'exitFlightLevel', 'cruisingSpeed', 'numAircrafts', 'requestedFlightLevel', 'assignedHeading', 'assignedSpeed', 'clearedFlightLevel', 'numWaypoints']
  const timeField = ['estTimeOfEntry', 'departureTime', 'scheduledTime', 'actualLandingTime', 'arrivalTime', 'coordinatedExitTime', 'estimatedTimeOfEntry', 'arrivalTime']
  // const dataSfpl = fs.readFileSync('./sfpl_202403_22.log', 'utf8');
  const match = dataSfpl.match(regexMatch);
  
  for(let i = 0 ; i < match.length ; i++){
  // for(let i = 1 ; i < 4 ; i++){
    // const percentage = i+1/match.length*100;
    const percentage = i;
    const now = dayjs.utc().toISOString();
    const progress=  async(now, fileSfpl, percentage) => {
      const progressMessage = `${now} : ${fileSfpl} ${percentage} of ${match.length} completed`;
      console.log(progressMessage);
    }

    const sfplNow = match[i];
    regHeader.lastIndex = 0;
    const sfplHeader = regHeader.exec(sfplNow)
    if(!sfplHeader){
      continue;
    }else{
      const {time, mod, updType} = sfplHeader.groups
      const data = {
        "time" : time,
        "mod" : mod,
        "updType" : updType
      }
      if(updType == "New System Flight Plan inserted"){
        const field = parseFieldSfpi(sfplNow, updType, regexField, regupdateCahr, numFields, timeField, negatives, regexFlightPath, regOldNew)
        const {fieldsData}  = field;
        data["fieldsData"] = fieldsData;
        await putDatabase(data);
        await progress(now, fileSfpl, percentage);
        // console.log(data);
      }
      else if(updType == "System Flight Plan updated"){
        const field = parseFieldSfpi(sfplNow, updType, regexField, regupdateCahr, numFields, timeField, negatives, regexFlightPath, regOldNew);
        const {fieldsData, updatedData}  = field;
        data["fieldsData"] = fieldsData;
        data["updatedData"] = updatedData
        await putDatabase(data);
        await progress(now, fileSfpl, percentage);
        // console.log(data);
        // break;
      }else if(updType == "New System Flight Path inserted" || updType == "System Flight Path updated"){
        const field = parseFieldSfpi(sfplNow, updType, regexField, regupdateCahr, numFields, timeField, negatives, regexFlightPath, regOldNew)
        const {fieldsData}  = field;
        const newdata = {...data, ...fieldsData}
        await putDatabase(newdata);
        await progress(now, fileSfpl, percentage);
        // break;
      }
      // console.log(data);
      // break;
    }
    // break;
  }


}

function parseFieldSfpi(sfplNow, updType, regexField, regupdateCahr, numFields, timeField, negatives, regexFlightPath, regOldNew){
  const matchField = sfplNow.match(regexField);
  const fieldsData = {}
  const updatedData = {}
  for(let j = 0 ; j < matchField.length ; j++){
    const matchFieldNow = matchField[j];
    regexField.lastIndex = 0;
    const execField = regexField.exec(matchFieldNow);
    const fieldName = convertToCamelCase(execField.groups.field);
    var value = execField.groups.val == "" ? null : execField.groups.val;
    
    if(updType == "New System Flight Plan inserted" || updType == "New System Flight Path inserted"){
      if(numFields.includes(fieldName) | timeField.includes(fieldName)){
        value = convertToInt(fieldName, negatives, execField, value, numFields);
      }
    }else if(updType == "System Flight Plan updated" || updType == "System Flight Path updated"){
      if(value !== "" && value !== null){
        const valueUpdate = value.match(regupdateCahr);
        if(valueUpdate){
          regOldNew.lastIndex = 0;
          const checkOldNew = regOldNew.exec(value);
          if(checkOldNew.groups.new == "" || checkOldNew.groups.new == null){
            if(numFields.includes(fieldName)){
              value = negatives.includes(checkOldNew.groups.old) ? null : parseInt(checkOldNew.groups.old);
            }else{
              value = negatives.includes(checkOldNew.groups.old) ? null : checkOldNew.groups.old;
            }
          }else{
            if(numFields.includes(fieldName)){
              value = negatives.includes(checkOldNew.groups.new) ? null : parseInt(checkOldNew.groups.new);
            }else{
              value = negatives.includes(checkOldNew.groups.new) ? null : checkOldNew.groups.new;
            }

            updatedData[fieldName] = value
          }
        }else{
          if(numFields.includes(fieldName) | timeField.includes(fieldName)){
            value = convertToInt(fieldName, negatives, execField, value, numFields);
          }   
        }
      }
    }
    fieldsData[fieldName] = value;
  }
 
  if(updType == "New System Flight Path inserted" || updType == "System Flight Path updated"){
    const matchPath = sfplNow.match(regexFlightPath);
    const path= []
    if(matchPath){
      for(let k = 0 ; k < matchPath.length ; k++){
        regexFlightPath.lastIndex = 0
        const execPath = regexFlightPath.exec(matchPath[k]);
        const { pointName, est, typ, newEst, newTyp } = execPath.groups;
        const pathItem = {
          "pointName" : pointName,
          "time" : !newEst ?
                    (negatives.includes(est) ? null : est):
                    newEst,
          "status" : !newEst ? 
                      (typ === "ATO" ? "Flown" : 
                       typ === "STO" ? "Scheduled" : 
                       typ === "ETO" ? "Estimated" : null) : 
                       (
                        newTyp === "ATO" ? "Flown" : 
                        newTyp === "STO" ? "Scheduled" : 
                        newTyp === "ETO" ? "Estimated" : null),
                      
                       
                       
        }
        path.push(pathItem);
      }
    }
    fieldsData["path"] = path
  }
  return {fieldsData, updatedData}
}

function convertToInt (fieldName, negatives, execField, valueOld, numFields){
  if(negatives.includes(valueOld)){
    var newValue = null
  }else if(numFields.includes(fieldName)){
    var newValue = parseInt(execField.groups.val)
  }else{
    var newValue = valueOld
  }
  return newValue;
}

function convertToCamelCase(str) {
  str = str.replace(/\./g, '');
  str = str.toLowerCase();
  let words = str.split(' ');
  for (let i = 1; i < words.length; i++) {
    if (words[i]) {
        words[i] = words[i][0].toUpperCase() + words[i].substring(1);
    }
}
  // Join the words back together
  return words.join('');
}

async function putDatabase(data){
  const file = data
  if(!file.path){
    const fileData = !file.updatedData ? file.fieldsData : file.updatedData;
    const dataInputed = {
      id: String(file.fieldsData.sfpi),
      state: file.fieldsData.state,
      travelType: file.fieldsData.travelType,
      flightType: file.fieldsData.flightType,
      flightRules: file.fieldsData.flightRules,
      callsign: file.fieldsData.callsign,
      aircraftReg: file.fieldsData.aircraftReg,
      aircraftType: file.fieldsData.aircraftType,
      wakeTurbulance: file.fieldsData.wakeTurbulance,
      navigationEquip: file.fieldsData.navigationEquip,
      surveillanceEquip: file.fieldsData.surveillanceEquip,
      ssrCode: file.fieldsData.ssrCode,
      estTimeOfEntry: file.fieldsData.estTimeOfEntry == null ? null : dayjs.utc(file.fieldsData.estTimeOfEntry).toDate(),
      clearedFlightLevel: file.fieldsData.clearedFlightLevel,
      exitFlightLevel: file.fieldsData.exitFlightLevel,
      requestedFlightLevel: file.fieldsData.requestedFlightLevel,
      cruisingSpeed: file.fieldsData.cruisingSpeed,
      adep: file.fieldsData.adep,
      ades: file.fieldsData.ades,
      departureTime: file.fieldsData.departureTime == null ? null : dayjs.utc(file.fieldsData.departureTime).toDate(),
      scheduledTime: file.fieldsData.scheduledTime == null ? null : dayjs.utc(file.fieldsData.scheduledTime).toDate(),
      operatorInfo: file.fieldsData.operatorInfo,
      terminateMode: file.fieldsData.terminateMode,
      xflApprovalState: file.fieldsData.xflApprovalState,
      coordinationState: file.fieldsData. coordinationState,
      revision: file.fieldsData.revision,
      operatorInfo2: file.fieldsData.operatorInfo2,
      assignedSpeed: file.fieldsData.assignedSpeed,
      assignedHeading: file.fieldsData.assignedHeading,
      radarIdentification: file.fieldsData.radarIdentification,
      actualLandingTime: file.fieldsData.actualLandingTime == null ? null : dayjs.utc(file.fieldsData.actualLandingTime).toDate(),
      numAircrafts : file.fieldsData.numAircrafts,
      fuel: file.fieldsData.fuel,
      specApproach: file.fieldsData.specApproach,
      alternateSsrCode: file.fieldsData.alternateSsrCode,
      pbnEquip: file.fieldsData.pbnEquip,
      fplFormat: file.fieldsData.fplFormat,
      log: {
        create: {
          time: file.time == null ? null : dayjs.utc(file.time).toDate(),
          mod: file.mod,
          updType: file.updType,
          data: JSON.stringify(fileData)
        }
      }
    }

    const check = await prisma.sfpis.findFirst({
      where: {
        id: String(file.fieldsData.sfpi)
      }
    })

    if(!check){
      await prisma.sfpis.create({
        data: dataInputed
      })
    }else{
      await prisma.sfpis.update({
        where: {
          id: String(file.fieldsData.sfpi), 
        },
        data: dataInputed
      })
    }

    if(file.updType === "New System Flight Plan inserted" && file.fieldsData.state === "REFERRED"){
      await prisma.referred.create({
        data : {
          id: String(file.fieldsData.sfpi),
          state: file.fieldsData.state,
          travelType: file.fieldsData.travelType,
          flightType: file.fieldsData.flightType,
          flightRules: file.fieldsData.flightRules,
          callsign: file.fieldsData.callsign,
          aircraftReg: file.fieldsData.aircraftReg,
          aircraftType: file.fieldsData.aircraftType,
          wakeTurbulance: file.fieldsData.wakeTurbulance,
          navigationEquip: file.fieldsData.navigationEquip,
          surveillanceEquip: file.fieldsData.surveillanceEquip,
          ssrCode: file.fieldsData.ssrCode,
          estTimeOfEntry: file.fieldsData.estTimeOfEntry == null ? null : dayjs.utc(file.fieldsData.estTimeOfEntry).toDate(),
          clearedFlightLevel: file.fieldsData.clearedFlightLevel,
          exitFlightLevel: file.fieldsData.exitFlightLevel,
          requestedFlightLevel: file.fieldsData.requestedFlightLevel,
          cruisingSpeed: file.fieldsData.cruisingSpeed,
          adep: file.fieldsData.adep,
          ades: file.fieldsData.ades,
          departureTime: file.fieldsData.departureTime == null ? null : dayjs.utc(file.fieldsData.departureTime).toDate(),
          scheduledTime: file.fieldsData.scheduledTime == null ? null : dayjs.utc(file.fieldsData.scheduledTime).toDate(),
          operatorInfo: file.fieldsData.operatorInfo,
          terminateMode: file.fieldsData.terminateMode,
          xflApprovalState: file.fieldsData.xflApprovalState,
          coordinationState: file.fieldsData. coordinationState,
          revision: file.fieldsData.revision,
          operatorInfo2: file.fieldsData.operatorInfo2,
          assignedSpeed: file.fieldsData.assignedSpeed,
          assignedHeading: file.fieldsData.assignedHeading,
          radarIdentification: file.fieldsData.radarIdentification,
          actualLandingTime: file.fieldsData.actualLandingTime == null ? null : dayjs.utc(file.fieldsData.actualLandingTime).toDate(),
          numAircrafts : file.fieldsData.numAircrafts,
          fuel: file.fieldsData.fuel,
          specApproach: file.fieldsData.specApproach,
          alternateSsrCode: file.fieldsData.alternateSsrCode,
          pbnEquip: file.fieldsData.pbnEquip,
          fplFormat: file.fieldsData.fplFormat,
          fpl: null
        }    
      })
    }
  }else{
    const checkSfpi = await prisma.sfpis.findFirst({
      where: {
        id: String(file.sfpi)
      }
    })
    const filePath = !file.path ? file : file.path;
    if(checkSfpi){
      const estEntry = file.estimatedTimeOfEntry ? file.estimatedTimeOfEntry : file.estTimeOfEntry;
     
      await prisma.sfpis.update({
        where: {
          id: String(file.sfpi), 
        },
        data:{
          log: {
            create: {
              time: dayjs.utc(file.time).toDate(),
              mod: file.mod,
              updType: file.updType,
              data: file.path.length == 0 ? null : JSON.stringify(filePath)
            }
          },
          logPath:{
            create: {
              time: dayjs.utc(file.time).toDate(),
              mod: file.mod,
              updType: file.updType,
              arrivalTime: file.arrivalTime == null ? null : dayjs.utc(file.arrivalTime).toDate(),
              estTimeOfEntry: estEntry == null ? null : dayjs.utc(estEntry).toDate(),
              coordinatedExitTime: file.coordinatedExitTime == null ? null : dayjs.utc(file.coordinatedExitTime).toDate(),
              previousFir: file.previousFir,
              nextFir: file.nextFir,
              numWaypoints: file.numWaypoints,
              paths: file.path.length == 0 ? null : JSON.stringify(filePath)
            }
          }
        }
      })
      
      const checkPath = await prisma.paths.findMany({
        where: {
          sfpiId: String(file.sfpi)
        }
      })
      if(checkPath.length == 0 || checkPath == "" && file.path.length > 0){
        for(var m = 0; m < file.path.length ; m++){
          if(file.path[m].time != null){
            await prisma.sfpis.update({
              where: {
                id: String(file.sfpi), 
              },
              data: {
                path: {
                  create: {
                    logTime: dayjs.utc(file.time).toDate(),
                    pointName: file.path[m].pointName,
                    time: file.path[m].time == null ? null : dayjs.utc(file.path[m].time).toDate(),
                    status: file.path[m].status,
                  }
                },
              }
            })
          }
        }
      }else if(file.path.length > 0){
        await prisma.paths.deleteMany({
          where: {
            sfpiId: String(file.sfpi)
          }
        })
  
        for(var m = 0; m < file.path.length ; m++){
          if(file.path[m].time != null){
            await prisma.sfpis.update({
              where: {
                id: String(file.sfpi), 
              },
              data: {
                path: {
                  create: {
                    logTime: dayjs.utc(file.time).toDate(),
                    pointName: file.path[m].pointName,
                    time: file.path[m].time == null ? null : dayjs.utc(file.path[m].time).toDate(),
                    status: file.path[m].status,
                  }
                },
              }
            })
          }
        }
      }
    }
  }
}

processFile(); 