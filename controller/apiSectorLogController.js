const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const fs = require('fs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

module.exports = {
  buffering: async (req, res) => {
    try {
      res.sendStatus(200);
      var data = ""

      req.on('data', items => {
        data += items;
      });
      req.on('end', () => {
        // console.log('Received data:', data);
        // fs.writeFileSync('cobaStream.txt', data);
        inputData(data)
        res.end(() => data = "");
      });

      const inputData = async (data) => {
        const dataSfpl = data;
        const regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w*|\d*):((?: New)? SFPL Sector Assignment (?:inserted|updated)):\s*SFPI\s*= (\d*)\s*CURRENT SECTOR\s*= (\w*|\w* --> \w*)?\s*NEW SECTOR\s*= ( --> \w*|\w* -->|)\s*CWP IDENTIFIER\s*=\s*(--> \d*|\d* -->)?\s*HANDOVER STATE\s*=\s*(\w* --> \w*|\w*)\s*PASSED SECTORS\s*=\s*(\d* --> \d*|\d*)/gm
        const regexIsEntry = /^ --> \w*$/;
        const match = dataSfpl.match(regex);

        if (match !== null) {

          for (let i = 0; i < match.length; i++) {
            regex.lastIndex = 0;
            const getData = regex.exec(match[i]);
            const isEntry = regexIsEntry.test(getData[5]);
            const entrySector = getData[3].includes('New SFPL Sector Assignment inserted') || getData[8] === 'SELECT --> IDLE' || isEntry === true ? true : false;

            if (getData !== null) {
              const database = await prisma.sectorLogs.findFirst({
                where: {
                  sfpiId: getData[4],
                  time: dayjs.utc(getData[1]).format(),
                  // onCwp: getData[2],
                  initialState: getData[3],
                  currentSector: getData[5],
                  newSector: getData[6],
                  cwpIndentifier: getData[7],
                  handoverState: getData[8],
                  passedSector: getData[9],
                  isEntry: entrySector
                }
              });

              const sfpi = await prisma.sfpis.findFirst({
                where: {
                  id: getData[4]
                }
              })

              if (!database && sfpi) {
                const dataInputed = await prisma.sectorLogs.create({
                  data: {
                    sfpiId: getData[4],
                    time: dayjs.utc(getData[1]).format(),
                    onCwp: getData[2],
                    initialState: getData[3],
                    currentSector: getData[5],
                    newSector: getData[6],
                    cwpIndentifier: getData[7],
                    handoverState: getData[8],
                    passedSector: getData[9],
                    isEntry: entrySector
                  }
                });

                const gettingData = await prisma.sectorLogs.findFirst({
                  where: {
                    id: dataInputed.id
                  },
                  select: {
                    sfpi: {
                      select: {
                        callsign: true
                      }
                    }
                  }
                });

                const now = dayjs.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
                console.log(`${now} : Sector Log For ${gettingData.sfpi.callsign}`);
              } else {
                continue;
              }
            } else {
              console.log('error')
            }
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  },

  readSectorLog: async (req, res) => {
    const targetDate = dayjs.utc(req.body['date']).toDate()
    // const targetDate = dayjs.utc('2024-03-22').toDate();
    const tomorow = dayjs.utc(targetDate).add(1, 'day').toDate();
    const regexIsEntry = /(?:\w*) --> (\w*)/;
    // res.sendStatus(200)
    try {
      const sfpiIdData = [];
      // const sfpiIdData = ['17255082'];
      const allData = [];

      const calculateDuration = (start, end) => {
        const startTime = dayjs.utc(start);
        const endTime = dayjs.utc(end);
        const duration = endTime.diff(startTime, 'minute');
        return duration;
      }

      /**GETTING SFPID */
      const sectorLog = await prisma.sectorLogs.findMany({
        where: {
          isEntry: true,
          time: {
            gte: targetDate,
            lt: tomorow
          }
        },
        select: {
          sfpiId: true,
        }
      });

      for (let h = 0; h < sectorLog.length; h++) {
        if (!sfpiIdData.includes(sectorLog[h].sfpiId)) {
          sfpiIdData.push(sectorLog[h].sfpiId)
        }
      }

      /**GETTING SECTOR LOG */
      for (let i = 0; i < sfpiIdData.length; i++) {
        // for(let i = 1 ; i < 2 ; i++){
        const sectorLogProcess = await prisma.sectorLogs.findMany({
          where: {
            sfpiId: sfpiIdData[i],
            isEntry: true,
            time: {
              gte: targetDate,
              lt: tomorow
            }
          },
          select: {
            time: true,
            sfpiId: true,
            initialState: true,
            currentSector: true,
            isEntry: true,
            handoverState: true,
            sfpi: {
              select: {
                callsign: true,
                adep: true,
                ades: true
              }
            },
          },
          orderBy: {
            time: 'asc'
          }
        });

        /**PUSHING DATA INTO AN ARRAY */
        for (let j = 0; j < sectorLogProcess.length; j++) {
          if (j == sectorLogProcess.length - 1) {
            /**CALCULATING DURATION */
            const lastTime = dayjs.utc(sectorLogProcess[j].time).format()
            const lastLog = await prisma.sectorLogs.findFirst({
              where: {
                sfpiId: sectorLogProcess[j].sfpiId,
                time: {
                  gt: lastTime
                },
              },
              orderBy: {
                time: 'desc'
              }
            })
            if (lastLog) {
              var nextTime = lastLog.time;
            }
          } else {
            var nextTime = sectorLogProcess[j + 1].time;
          }

          const currentTime = sectorLogProcess[j].time;
          const duration = calculateDuration(currentTime, nextTime);
          sectorLogProcess[j].duration = duration;

          /**GETTING SECTOR NAME */
          const isEntryRegex = regexIsEntry.exec(sectorLogProcess[j].currentSector);
          const sameSector = [];

          /**CHECKINGG SECTOR LOG PROCESS HAS SAME SECTOR OR NO */
          if (j > 0) {
            for (let k = j - 1; k >= 0; k--) {
              const regexCurrentSector = /^(?: --> )?(\w*)$/
              const currentSector = regexCurrentSector.exec(sectorLogProcess[k].currentSector);
              
              if (j != 0 && isEntryRegex) {
                if((currentSector && isEntryRegex[1] == currentSector[1]) || (isEntryRegex[1] == sectorLogProcess[k].currentSector)){
                  sectorLogProcess[j - 1].duration = sectorLogProcess[j - 1].duration + duration
                  sameSector.push(k)
                }
              }

              if (k == 0 && sameSector.length == 0) {
                sectorLogProcess[j].sector = isEntryRegex ? isEntryRegex[1] : sectorLogProcess[j].currentSector;
                allData.push(sectorLogProcess[j]);
              }
            }
          } else {
            sectorLogProcess[j].sector = isEntryRegex ? isEntryRegex[1] : sectorLogProcess[j].currentSector;
            allData.push(sectorLogProcess[j]);
          }
        }
      }
      // res.json(allData);
      /**GROUPING INTO EACH SECTOR */
      const groupedData = new Map();
      // Iterate through the data
      allData.forEach(entry => {
        const sectorOwner = entry.sector;
        // const time = new Date(entry.time);
        // const time = new Date(new Date(newData[i][j].time).getTime() - new Date().getTimezoneOffset() * 60000),
        const hour = parseInt(dayjs.utc(entry.time).format('H'));

        // Check if the sector is already in the map
        if (!groupedData.has(sectorOwner)) {
          // If not, add it with an empty array
          groupedData.set(sectorOwner, []);
        }

        // Push the entry to the corresponding sectorOwner and hour
        groupedData.get(sectorOwner).push({ ...entry, hour });
      });

      // Convert the Map to an array of objects
      const result = Array.from(groupedData, ([sectorOwner, entries]) => ({ sectorOwner, entries }));

      res.json(result)
      // console.log(result.length);
    } catch (error) {
      console.log(error)
    }
  },

  modalSectorLog: async (req, res) => {
    const targetDate = dayjs.utc(req.body['date']).toDate()
    // const targetDate = dayjs.utc('2024-03-22').toDate();
    const tomorow = dayjs.utc(targetDate).add(1, 'day').toDate();

    try {
      const sector = req.body['sector'];

      const reportSelected = await prisma.report.findMany({
        where: {
          sector: sector,
          time: {
            gte: targetDate, // Greater than or equal to the target date
            lt: tomorow, // Less than the next day
          }
        },
        select: {
          sfpiId: true,
          sector: true,
          time: true,
          sfpi: {
            select: {
              callsign: true,
              adep: true,
              ades: true
            }
          }
        },
      })

      const extractHour = (record) => {
        const time = new Date(record.time);
        return time.getHours();
      }

      const groupedData = reportSelected.reduce((result, record) => {
        const hour = extractHour(record);
        if (!result[hour]) {
          result[hour] = [];
        }

        result[hour].push(record);
        return result;
      }, {});

      const groupedArray = [];
      for (var requestedHour = 0; requestedHour < 24; requestedHour++) {
        const amountTraffic = groupedData[String(requestedHour)] == undefined ? 0 : groupedData[String(requestedHour)].length;
        const traffic = groupedData[String(requestedHour)] == undefined ? 0 : groupedData[String(requestedHour)];
        const json = { hour: requestedHour, amount: amountTraffic, traffic: traffic };
        groupedArray.push(json);
      }
      res.json(groupedArray);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
}
