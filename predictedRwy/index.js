const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { exec } = require('child_process');
dayjs.extend(utc);

const execute = async (month, day) => {
  const start = dayjs.utc(`2024-${month}-${day}`).startOf('day').toDate();
  const stop = dayjs.utc(start).add(1, 'day').toDate();
  const app = ["10", "09", "08", "07", "06", "05", "04", "03", "202", "01"];
  const twr = ["TWR1", "TWR2", "TWR4", "TWR6", "awptwr1", "awptwr2", "249"];
  const insertDatabase = async (key, value) => {
    if (key != undefined && value != null) {
      const time = dayjs.utc().format("YYYY-MM-DD HH:mm:ss");
      await prisma.sfpis.update({
        where: {
          id: String(key)
        },
        data: {
          predictedRwy: String(value)
        }
      })

      console.log(`${time} -> ${key} -- ${value} ${dayjs.utc(start).format("YYYY-MM-DD")}`);
    }
  }

  const combine = [...app, ...twr];

  const sfpi = await prisma.sfpis.findMany({
    where: {
      // id: "17954384",
      estTimeOfEntry: {
        gte: start,
        lt: stop
      },
      OR: [
        { adep: "WIII" },
        { ades: "WIII" }
      ]
    },
    select: {
      id: true,
      callsign: true,
      adep: true,
      ades: true,
      estTimeOfEntry: true,
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

  for (let h in sfpi) {
    const logOnly = sfpi[h].log;

    const log = sfpi[h].adep == "WIII" ? logOnly.filter(data => twr.includes(data.mod)) :
      sfpi[h].ades == "WIII" ? logOnly.filter(data => app.includes(data.mod)) : null;

    if (sfpi[h].adep == "WIII") {
      await departure(sfpi[h].id, log, insertDatabase);
    } else if (sfpi[h].ades == "WIII") {
      await arrival(sfpi[h].id, log, insertDatabase, sfpi[h]);
    }
  }
}

const processFile = async () => {
  try {
    for (let month = 1; month <= 12; month++) {
      const monthFinal = month < 10 ? `0${month}` : month;
      const dayRunning = [1, 2, 3, 4, 5, 6, 7];
      for (let day = 1; day <= 31; day++) {
        const dayLight = day < 10 ? `0${day}` : day;
        // if (month == 1 && dayRunning.includes(day)) {
        //   continue
        // }
        await execute(monthFinal, dayLight);
      }
    }
    // / After all loops are completed, stop PM2
    exec('pm2 stop 9', (error, stdout, stderr) => {
      if (error) {
        console.error('Failed to stop PM2 process with ID 9:', error);
        return;
      }
  
      if (stderr) {
        console.error('Error stopping PM2 process with ID 9:', stderr);
        return;
      }
  
      console.log('PM2 process with ID 1 has been stopped successfully.');
      console.log(stdout);
    });
  } catch (error) {
  //  After all loops are completed, stop PM2
    exec('pm2 stop 9', (error, stdout, stderr) => {
      if (error) {
        console.error('Failed to stop PM2 process with ID 9:', error);
        return;
      }

      if (stderr) {
        console.error('Error stopping PM2 process with ID 9:', stderr);
        return;
      }

      console.log('PM2 process with ID 1 has been stopped successfully.');
      console.log(stdout);
    });
    console.log(error)
  }
}

processFile();

async function departure(id, logTwr, insertDatabase) {
  const groupDataTwr = {};
  const json = {
    "07L": ["2A", "1B"],
    "07R": ["2B", "1C"],
    "25L": ["2C", "1E", "CC"],
    "25R": ["2D", "1F"]
  }
  for (let j in logTwr) {
    const data = JSON.parse(logTwr[j].data)
    const operatorInfo = data.operatorInfo;
    if (data.operatorInfo) {
      const operatorInfoSplit = operatorInfo.split(" ");
      for (let k in operatorInfoSplit) {
        const charSelected = operatorInfoSplit[k].slice(-2);
        const keyFound = Object.keys(json).find(key => json[key].includes(charSelected));
        if (keyFound) {
          if (!groupDataTwr[id]) {
            groupDataTwr[id] = []
          }
          groupDataTwr[id].push(keyFound);

        }
      }
    }
  }

  const key = Object.keys(groupDataTwr);
  const idKey = key[0]
  const values = Object.values(groupDataTwr);

  var value = values.length > 0 && values[0].length > 0 ? valueFunction(values[0]) : null;

  await insertDatabase(idKey, value);
  (async () => {
    for(const [key, values] of Object.entries(groupDataTwr) ){
      const value = values[values.length - 1]
      await insertDatabase(key, value);
    }
  })();
}

async function arrival(id, log, insertDatabase, sfpi) {
  const posibleString = ["R", "L", "25R", "25L", "24", "06", "RR", "LL", "7R", "7L", "RRR", "LLL", "07L", "07R"];
  const groupData = {};
  const logPath = await prisma.logPaths.findFirst({
    where: {
      sfpiId: id,
      updType: {
        not: 'New System Flight Path inserted'
      }
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

  if (logPath) {
    const path = JSON.parse(logPath.paths);
    if (path != null && path.length != 0) {
      const lastPoint = path[path.length - 1];
      var initialRwy = lastPoint.pointName == "OBGEG" ? "25L" :
        lastPoint.pointName == "PRIOK" ? "25R" :
          lastPoint.pointName == "OLPAS" ? "07R" :
            lastPoint.pointName == "NININ" ? "07L" : null;
    } else {
      var initialRwy = null;
    }

    if (log.length != 0) {
      const filterLogOps2 = log.filter(data => data.data.includes("operatorInfo2"))

      for (let i = 0; i < filterLogOps2.length; i++) {
        const parseData = JSON.parse(filterLogOps2[i].data);
        const operatorInfo2 = parseData.operatorInfo2;
        var initialRwy = await parseOperatorInfo2(initialRwy, operatorInfo2, posibleString);
        const x = ["R", "RR", "RRR", "RRRR", "L", "LL", "LLL", "LLLL"];
        if (initialRwy == "7R" || initialRwy == "7L") {
          var initialRwy = "0" + initialRwy
        } else if (initialRwy != null && x.includes(initialRwy)) {
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

          if (predictedRwy) {
            const rightRegex = /R/gm;
            const leftRegex = /L/gm;
            const testRight = rightRegex.test(initialRwy);
            const testLeft = leftRegex.test(initialRwy);
            if (predictedRwy.predictedRwy == "06" || predictedRwy.predictedRwy == "07R" || predictedRwy.predictedRwy == "07L") {
              if (testRight) {
                var initialRwy = "07R"
              } else if (testLeft) {
                var initialRwy = "07L"
              }
            } else {
              if (testRight) {
                var initialRwy = "25R"
              } else if (testLeft) {
                var initialRwy = "25L"
              }
            }
          }
        } else if (initialRwy == null) {
          if (sfpi.adep == "WILL" || sfpi.adep == "WIGG" || sfpi.adep == "WIPL") {

            const findLog = log.find(data => data.data.includes("<"));
            if (findLog) {
              const regexFindLog = /(?<fltNumber>\d+)/gm
              const dataLog = JSON.parse(findLog.data);
              regexFindLog.lastIndex = 0
              const exect = regexFindLog.exec(dataLog.operatorInfo2);
              if (exect) {
                const { fltNumber } = exect.groups;
                const matchSfpi = await prisma.sfpis.findFirst({
                  where: {
                    callsign: {
                      contains: fltNumber
                    },
                    estTimeOfEntry: {
                      gte: dayjs.utc(sfpi.estTimeOfEntry).subtract(3, 'hour').toDate(),
                      lte: dayjs.utc(sfpi.estTimeOfEntry).add(30, 'minutes').toDate(),
                    },
                    predictedRwy: {
                      not: null
                    }
                  },
                  select: {
                    callsign: true,
                    predictedRwy: true,
                    estTimeOfEntry: true,
                  },
                  orderBy: {
                    estTimeOfEntry: 'desc'
                  }
                });
                if (matchSfpi) {
                  var initialRwy = matchSfpi.predictedRwy
                }
              }
            }
          }
        }
        if (!groupData[id]) {
          groupData[id] = []
        }
        groupData[id].push(initialRwy);
      }
    } else {
      if (initialRwy == null) {
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

      if (!groupData[id]) {
        groupData[id] = []
      }

      if (initialRwy == "7R" || initialRwy == "7L") {
        var initialRwy = "0" + initialRwy
      }

      groupData[id].push(initialRwy);
    }
  }
  const key = Object.keys(groupData);
  const idKey = key[0]
  const values = Object.values(groupData);
  var value = values.length > 0 && values[0].length > 0 ? valueFunction(values[0]) : null;

  await insertDatabase(idKey, value);

  // (async () => {
  //   for(const [key, values] of Object.entries(groupData)){
  //     const value = values[values.length - 1]
  //     await insertDatabase(key, value);
  //   }
  // })();
}

async function parseOperatorInfo2(initialRwy, operatorInfo2, posibleString) {
  if (operatorInfo2 != null) {
    const operatorInfo2Split = operatorInfo2.split(" ");

    // Find the first match
    const matchedString = operatorInfo2Split.filter(element => posibleString.includes(element));

    if (matchedString.length != 0 && (initialRwy != null || initialRwy == null)) {
      const matchedStringSelected = matchedString[0];
      const matchedStringLast = matchedStringSelected[matchedStringSelected.length - 1];

      if (initialRwy == null) {
        var initialRwyLast = null;
      } else {
        var initialRwyLast = initialRwy[initialRwy.length - 1];
      }

      if (matchedString[0] !== "24" && matchedString[0] !== "06" && matchedString.length != 0) {
        if (initialRwyLast == null) {
          var initialRwy = matchedStringSelected
        } else {
          if (initialRwy == "06" && (matchedStringLast == "L" || matchedStringLast == "R")) {
            var initialRwy = "07" + matchedStringLast;
            // console.log(matchedString);
          } else {
            var initialRwy = initialRwy.replace(initialRwyLast, matchedStringLast);
          }
        }
      } else if (matchedString == "24" || matchedString == "06") {
        initialRwy = matchedString[0];
        // console.log(`${log[i].sfpiId} - ${initialRwy}`);
      }
    }
  }

  return initialRwy
}

function valueFunction(values) {
  var value = null;
  for (let a = values.length - 1; a >= 0; a--) {
    if (values[a] == null) {
      continue
    } else {
      value = values[a];
      break;
    }
  }

  return value;
}