const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const posibleChar = require('./posibleChar.json');
dayjs.extend(utc);

const execute = async() => {
  const start = dayjs.utc("2024-08-22 00:00:00").toDate();
  const stop = dayjs.utc(start).add(1, 'day').toDate();
  const app = ["10","09","08","07","06","05","04","03","202","01"];
  const twr = ["TWR1", "TWR2", "TWR4", "TWR6", "awptwr1", "awptwr2", "249"];
  const insertDatabase = async (key, value) => {
    // await prisma.sfpis.update({
    //   where: {
    //     id: String(key)
    //   },
    //   data: {
    //     predictedRwy: String(value)
    //   }
    // })
    console.log(`${key} -- ${value}`);
  }
  const combine = [...app, ...twr];
  
  const sfpi = await prisma.sfpis.findMany({
    where: {
      // id: "17946188",
      estTimeOfEntry: {
        gte: start,
        lt: stop
      },
      OR: [
        {adep: "WIII"},
        {ades: "WIII"}
      ]
    },
    select: {
      id: true,
      callsign: true,
      adep: true,
      ades: true,
      log: {
        where: {
          mod: {
            in: combine
          },
          data: {
            contains: "operatorInfo"
          }
        },
        orderBy: {
          time: 'asc'
        },
      }
    },
    orderBy: {
      estTimeOfEntry: 'asc'
    }
  })
  
  for (let h in sfpi){
    const logOnly = sfpi[h].log;
   
    const log = sfpi[h].adep == "WIII" ? logOnly.filter(data => twr.includes(data.mod)) :
                sfpi[h].ades == "WIII" ? logOnly.filter(data => app.includes(data.mod)): null;
    
    if(sfpi[h].adep == "WIII"){
      await departure(sfpi[h].id, log, insertDatabase);
    }else if(sfpi[h].ades == "WIII"){
      await arrival(sfpi[h].id, log, insertDatabase);
    }
  }
}

execute()

async function departure(id, logTwr, insertDatabase) {
  const groupDataTwr = {};
  const json = {
    "07L" : ["2A", "1B"],
    "07R" : ["2B", "1C"],
    "25L" : ["2C", "1E", "CC"],
    "25R" : ["2D", "1F"]
  }
  for(let j in logTwr){
    const data = JSON.parse(logTwr[j].data)
    const operatorInfo = data.operatorInfo;
    const operatorInfoSplit = operatorInfo.split(" ");

    for(let k in operatorInfoSplit){
      const charSelected = operatorInfoSplit[k].slice(-2);
      const keyFound = Object.keys(json).find(key => json[key].includes(charSelected));
      if(keyFound){
        if(!groupDataTwr[id]){
          groupDataTwr[id] = []
        }
        groupDataTwr[id].push(keyFound);
        
      }
    }
  }

  (async () => {
    for(const [key, values] of Object.entries(groupDataTwr) ){
      const value = values[values.length - 1]
      await insertDatabase(key, value);
    }
  })();
}

async function arrival(id, log, insertDatabase){
  const posibleString = ["R", "L", "25R", "25L", "24", "06", "RR", "LL", "7R", "7L"];
  const groupData = {};
  const logPath = await prisma.logPaths.findFirst({
    where: {
      sfpiId: id
    },
    orderBy: [
      {
        numWaypoints: 'desc',
      },
      {
        time: 'desc'
      }
    ]
  })
  
  if(logPath){
    const path = JSON.parse(logPath.paths);
    const lastPoint = path[path.length - 1];
    var initialRwy = lastPoint.pointName == "OBGEG" ? "25L" :
                      lastPoint.pointName == "PRIOK" ? "25R" :
                      lastPoint.pointName == "OLPAS" ? "07R" :
                      lastPoint.pointName == "NININ" ? "07L" : null;
    
    if(log.length != 0){
      for(let i = 0 ; i < log.length ; i++){
        const parseData = JSON.parse(log[i].data);
        
        if("operatorInfo2" in parseData){ 
          // Extract operatorInfo2 value
          const operatorInfo2 = parseData.operatorInfo2;
          var initialRwy = await parseOperatorInfo2(initialRwy, operatorInfo2, posibleString)

          if(!groupData[id]){
            groupData[id] = []
          }
          if(initialRwy == "7R" || initialRwy == "7L"){
            var initialRwy = "0" + initialRwy
          }
        }
      }
    }else{
      if(initialRwy==null){
        const sfpiCheck = await prisma.sfpis.findFirst({
          where: {
            id: id
          },
          select: {
            operatorInfo2: true
          }
        });
        const operatorInfo2 = sfpiCheck.operatorInfo2;
        var initialRwy = await parseOperatorInfo2(initialRwy, operatorInfo2, posibleString)
      }
      // console.log(sfpiCheck);
      if(!groupData[id]){
        groupData[id] = []
      }
    }

    if(initialRwy == "L" || initialRwy == "R" || initialRwy == null){
      const time = dayjs.utc(log[log.length - 1].time).toDate();
     
      const predictedRwy = await prisma.sfpis.findFirst({
        where: {
          actualLandingTime: {
            gte: dayjs.utc(time).subtract(180, 'minutes').toDate(),
            lt: time
          },
          predictedRwy: {
            not: null,
          }
        },
        orderBy: {
          actualLandingTime: 'desc'
        },
        select: {
          callsign: true,
          predictedRwy: true
        }
      });
      
      if(initialRwy == null){
        if(predictedRwy != null){
          var initialRwy = predictedRwy.predictedRwy
        }
      }else{
        if(predictedRwy != null){
          const rwy = predictedRwy.predictedRwy.slice(0, -1);
          var initialRwy = `${rwy}${initialRwy}`
        }
      }

    }else if(initialRwy == "7R" || initialRwy == "7L"){
      var initialRwy = "0" + initialRwy
    }else if(initialRwy == "2R" || initialRwy == "2L"){
      var rwy = initialRwy.slice(1);
      var initialRwy = `25${rwy}`;
    }
    groupData[id].push(initialRwy);

  }
  
  (async () => {
    for(const [key, values] of Object.entries(groupData) ){
      const value = values[values.length - 1]
      await insertDatabase(key, value);
    }
  })();
}

async function parseOperatorInfo2(initialRwy, operatorInfo2, posibleString) {
  if(operatorInfo2 != null){
    const operatorInfo2Split = operatorInfo2.split(" ");
          
    // Find the first match
    const matchedString = operatorInfo2Split.filter(element => posibleString.includes(element));
    
    if (matchedString.length != 0 && (initialRwy != null || initialRwy == null)) {
      const matchedStringSelected = matchedString[0];
      const matchedStringLast = matchedStringSelected[matchedStringSelected.length - 1];

      if(initialRwy == null){
        var initialRwyLast = null;
      }else{
        var initialRwyLast = initialRwy[initialRwy.length - 1];
      }
      
      if(matchedString[0] !== "24" && matchedString[0] !== "06" && matchedString.length != 0){
        if(initialRwyLast == null){
          var initialRwy = matchedStringSelected
        }else{
          if(initialRwy == "06" && (matchedStringLast == "L" || matchedStringLast == "R")){
            var initialRwy = "07" + matchedStringLast;
            // console.log(matchedString);
          }else{
            var initialRwy = initialRwy.replace(initialRwyLast, matchedStringLast);
          }
        }
      }else if(matchedString == "24" || matchedString == "06"){
        initialRwy = matchedString[0];
        // console.log(`${log[i].sfpiId} - ${initialRwy}`);
      } 
    }
  }

  return initialRwy
}