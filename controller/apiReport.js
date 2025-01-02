const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const sector = require('../sector.json');
const {fic}= require('../ficGp')
dayjs.extend(utc);

module.exports = {
  dataReport: async (req, res) => {
    // const targetDate = new Date('2023-07-12T00:00:00Z');
    const targetDate = new Date(req.body['date']);
    targetDate.setUTCHours(0, 0, 0, 0)

    try {
      const report1 = await prisma.report.findMany({
        where: {
          time: {
            gte: targetDate, // Greater than or equal to the target date
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
          },
          sector: {
            notIn: ['FIC', 'GP']
          }
        },
        select: {
          sfpiId: true,
          sector: true,
          time: true
        },
      })

      const ficTarget = await fic(targetDate);
      const report = [...report1, ...ficTarget];

      const groupedData = new Map();

      // Iterate through the data
      report.forEach(entry => {
        const sectorOwner = entry.sector;
        const time = new Date(entry.time);
        // const time = new Date(new Date(newData[i][j].time).getTime() - new Date().getTimezoneOffset() * 60000),
        const hour = time.getHours();

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

      res.json(result);


      // const data = await prisma.sfpis.findMany({
      //   where: {
      //     estTimeOfEntry: {
      //       gte: targetDate, // Greater than or equal to the target date
      //       lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
      //     },
      //   },
      //   select: {
      //     id: true,
      //     adep: true,
      //     ades: true,
      //   },
      //   orderBy: {
      //     estTimeOfEntry: 'asc'
      //   },
      //   // take: 10
      // });
      // // res.json(data);
      // for(let i = 0 ; i < data.length ; i ++){
      //   const firstLog = await prisma.logs.findFirst({
      //     where: {
      //       sfpiId: data[i].id,
      //       data: {
      //         contains: 'ACTIVE'
      //       }
      //     },
      //   });
      //   console.log(i);
      //   if(firstLog){
      //     const secondLog = await prisma.logs.findMany({
      //       where: {
      //         sfpiId: firstLog.sfpiId,
      //         mod: 'FDPS_FPL',
      //         data: {
      //           contains: 'pointName',
      //           not: {
      //             contains: 'null'
      //           }
      //         },
      //         time: {
      //           gte: firstLog.time
      //         }
      //       },
      //       select: {
      //         time:true,
      //         data: true,
      //       },
      //       orderBy: {
      //         id: 'desc'
      //       }
      //     })
      //     // res.json(secondLog);
      //     //////////////////SECOND FOR CARI DATA YANG PALING BANYAK DAN TIDAK ADA NULL
      //     if (secondLog.length !== 0) {
      //       const elementWithMaxData = secondLog.reduce((maxDataElement, currentElement) => {
      //           const maxData = JSON.parse(maxDataElement.data);
      //           const currentData = JSON.parse(currentElement.data);

      //           return maxData.length > currentData.length ? maxDataElement : currentElement;

      //       }, secondLog[0]);

      //       const dataOnly = JSON.parse(elementWithMaxData.data)
      //       const arroundJakarta = ['WIII', 'WIHH', 'WIRR', 'WICC', 'WICC']
      //       if(arroundJakarta.includes(data[i].adep) || arroundJakarta.includes(data[i].ades)){
      //         const acc = sector[0]["ACC"];
      //         const app = sector[1]["APP"];
      //         var sectorSelected = [...acc, ...app]
      //       }else{
      //         // console.log('outside jakarta');
      //         var sectorSelected = sector[0]["ACC"]
      //       }

      //       const matchPoint = (pointName) => {
      //         return sectorSelected.find(sectorItem => Object.values(sectorItem)[0].includes(pointName))
      //       }

      //       const dataWithSector = dataOnly.map(dataItem => {
      //         const sectorMatch = matchPoint(dataItem.pointName);
      //         return{
      //           ...dataItem,
      //           sector: sectorMatch ? Object.keys(sectorMatch)[0] : null
      //         }
      //       })

      //       const filteredDataWithSector = dataWithSector.filter(item => item.sector !== null);
      //       // res.json(filteredDataWithSector[0].sector)
      //       if(filteredDataWithSector.length !== 0){
      //         for(let j = 0 ; j < filteredDataWithSector.length ; j++){
      //           const takeReport = await prisma.report.findFirst({
      //             where: {
      //               sfpiId: data[i].id,
      //               sector : filteredDataWithSector[j].sector
      //             }
      //           })

      //           if(!takeReport || takeReport == null){
      //             await prisma.report.create({
      //               data: {
      //                 sfpiId: data[i].id,
      //                 sector: filteredDataWithSector[j].sector,
      //                 time: new Date(new Date(filteredDataWithSector[j].time).getTime() - new Date().getTimezoneOffset() * 60000),
      //               }
      //             })
      //           }else{
      //             continue;
      //           }
      //         }
      //       }else{
      //         continue;
      //       }
      //     }else{
      //       continue;
      //     }
      //   }
      // }


    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateReport: async (req, res) => {
    const targetDate = new Date(req.body['date']);
    targetDate.setUTCHours(0, 0, 0, 0)
    try {
      const sector = req.body['sector'];

      const reportSelected = await prisma.report.findMany({
        where: {
          sector: sector,
          time: {
            gte: targetDate, // Greater than or equal to the target date
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
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
      for (var hour = 0; hour < 24; hour++) {
        const amountTraffic = groupedData[String(hour)] == undefined ? 0 : groupedData[String(hour)].length;
        const json = { hour: hour, amount: amountTraffic }
        groupedArray.push(json);
      }
      // console.log(groupedArray);
      res.json(groupedArray);

      // console.log(groupedArray)
      // const groupedData = reportSelected.reduce((result, item) => {
      //   const time = new Date(item.time);
      //   const hourKey = time.getHours();
      //   const hour = time.getHours();

      //   if (!result[hourKey]) {
      //     result[hourKey] = [];
      //   }

      //   result[hourKey].push({...item,hour});

      //   return result;
      // }, {});

      // Iterate through the data
      // const groupedData = new Map();

      // reportSelected.forEach(entry => {
      //   const sectorOwner = entry.sector;
      //   const time = new Date(entry.time);
      //   // const time = new Date(new Date(newData[i][j].time).getTime() - new Date().getTimezoneOffset() * 60000),
      //   const hour = time.getHours();

      //   // Check if the sector is already in the map
      //   if (!groupedData.has(sectorOwner)) {
      //     // If not, add it with an empty array
      //     groupedData.set(sectorOwner, []);
      //   }

      //   // Push the entry to the corresponding sectorOwner and hour
      //   groupedData.get(sectorOwner).push({ ...entry, hour });
      // });

      // const finalHour = []
      //  // Convert the Map to an array of objects
      // const result = Array.from(groupedData, ([sectorOwner, entries]) => ({ entries }));
      // const newData = result[0]['entries'];


      // const countEntriesByHour = (dataArray, targetHour) => {
      // return dataArray.reduce((count, entry) => {
      //   console.log(entry);
      //   // return count + entry.filter(subEntry => subEntry.hour === targetHour).length;
      // }, 0)
      // }
      // console.log(countEntriesByHour(newData, 0));
      // res.json(newData);
      // for(let i = 0 ; i < 24 ; i ++){
      //   finalHour.push(countEntriesByHour(result, i))
      // }
      // console.log(finalHour);
      // console.log(result);
      //  res.json(result);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateReportTable: async (req, res) => {
    const targetDate = new Date(req.body['date']);
    // const targetDate = new Date('2024-03-03T00:00:00Z');
    try {
      const sector = req.body['sector'];
      const requestedHour = req.body['hour'];
      const reportSelected = await prisma.report.findMany({
        where: {
          sector: sector,
          time: {
            gte: targetDate, // Greater than or equal to the target date
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
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

      const amountTraffic = groupedData[String(requestedHour)] == undefined ? 0 : groupedData[String(requestedHour)].length;
      const traffic = groupedData[String(requestedHour)] == undefined ? 0 : groupedData[String(requestedHour)];
      const json = { hour: requestedHour, amount: amountTraffic, traffic: traffic };

      res.json(json)

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  lebaranReport: async (req, res) => {
    const targetDate = dayjs.utc(req.body['date']).format('YYYY-MM-DD');
    const high = ['2024-04-06', '2024-04-07', '2024-04-14', '2024-04-15'];
    const medium = ['2024-04-08', '2024-04-09', '2024-04-12', '2024-04-13'];
    const low = ['2024-04-10', '2024-04-11'];
    const highReference = dayjs.utc('2024-03-31 00:00:00').toDate();
    const mediumReference = dayjs.utc('2024-03-29 00:00:00').toDate();
    const lowReference = dayjs.utc('2024-03-26 00:00:00').toDate();

    if (high.includes(targetDate)) {
      var referenceDate = highReference
    } else if (medium.includes(targetDate)) {
      var referenceDate = mediumReference
    } else if (low.includes(targetDate)) {
      var referenceDate = lowReference
    }

    const tomorowReferenceDate = dayjs.utc(referenceDate).add(1, 'day').toDate();
    try {
      const report = await prisma.report.findMany({
        where: {
          time: {
            gte: referenceDate, // Greater than or equal to the target date
            lt: tomorowReferenceDate
          }
        },
        select: {
          sfpiId: true,
          sector: true,
          time: true
        },
      })


      const groupedData = new Map();

      // Iterate through the data
      report.forEach(entry => {
        const sectorOwner = entry.sector;
        const time = new Date(entry.time);
        // const time = new Date(new Date(newData[i][j].time).getTime() - new Date().getTimezoneOffset() * 60000),
        const hour = time.getHours();

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

      res.json(result);
    } catch (error) {
      console.log(error)
    }

  },

  tapor: async (req, res) => {
    try {
      const dateNow = dayjs.utc(req.body.date);
      const dateTomorow = dayjs.utc(req.body.date).add(1, "day");

      if (req.body.callSign) {
        var getData = await prisma.sfpis.findMany({
          where: {
            estTimeOfEntry: {
              gte: dayjs.utc(dateNow).toDate(),
              lt: dayjs.utc(dateTomorow).toDate()
            },
            callsign: req.body.callSign
          },
          select: {
            id: true,
            callsign: true,
            adep: true,
            ades: true,
            estTimeOfEntry: true,
            aircraftReg: true,
            aircraftType: true,
            clearedFlightLevel: true,
            requestedFlightLevel: true,
            exitFlightLevel: true,
            path: {
              select: {
                pointName: true,
                time: true
              }
            },
          },
          orderBy: {
            estTimeOfEntry: 'asc'
          }
        })
      } else {
        var getData = await prisma.sfpis.findMany({
          where: {
            estTimeOfEntry: {
              gte: dayjs.utc(dateNow).toDate(),
              lt: dayjs.utc(dateTomorow).toDate()
            },
            exitFlightLevel: {
              gt: 370,
            }
          },
          select: {
            id: true,
            callsign: true,
            adep: true,
            ades: true,
            estTimeOfEntry: true,
            aircraftReg: true,
            aircraftType: true,
            clearedFlightLevel: true,
            requestedFlightLevel: true,
            exitFlightLevel: true,
            path: {
              select: {
                pointName: true,
                time: true
              }
            },
          },
          orderBy: {
            callsign: 'asc'
          }
        })
      }

      for (let i = 0; i < getData.length; i++) {
        const log = await prisma.logs.findFirst({
          where: {
            sfpiId: getData[i].id,
            data: {
              contains: 'ACTIVE'
            }
          }
        })

        if (log) {
          const log2 = await prisma.logs.findFirst({
            where: {
              sfpiId: log.sfpiId,
              time: log.time,
              mod: 'FDPS_FPL',
              data: {
                contains: 'pointName'
              }
            },
            orderBy: {
              id: 'desc'
            }
          })

          if (log2) {
            getData[i]['log'] = JSON.parse(log2.data)
          }
        }
      }

      res.json(getData);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
