const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const sector = require('../sector.json')

module.exports = {
  dataReport: async(req, res) => {
    const targetDate = new Date();
    targetDate.setUTCHours(0,0,0,0)
    var p = 1
    var q = 1
    var r = 1
    try {
      // const data = await prisma.sfpis.findMany({
      //   where: {
      //     estTimeOfEntry: {
      //       gte: targetDate, // Greater than or equal to the target date
      //       lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
      //     },
      //   },
      //   include: {
      //     log: {
      //       select: {
      //         time : true,
      //         mod: true,
      //         sfpi: true,
      //         data: true
      //       },
      //       where:{
      //         mod: 'FDPS_FPL',
      //         NOT: {
      //           data: {
      //             contains: 'pointName'
      //           }
      //         }
      //       },
      //       orderBy: {
      //         id: 'asc'
      //       },
      //       take: 1
      //     }
      //   },
      //   orderBy: {
      //     estTimeOfEntry: 'asc'
      //   },
      //   take: 10
      // });
      const newData = []
      
      const data = await prisma.sfpis.findMany({
        where: {
          estTimeOfEntry: {
            gte: targetDate, // Greater than or equal to the target date
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
          },
        },
        select: {
          id: true,
        },
        orderBy: {
          estTimeOfEntry: 'asc'
        },
      });
      // console.log(data[448]);
      ////////////////////////////////////////////////////////////////
      // const logFirst = await prisma.logs.findFirst({
      //       where: {
      //         sfpiId: data[1446].id,
      //         data: {
      //           contains: 'ACTIVE'
      //         }
      //       },
      //     })
          
      //     const logSecond = await prisma.logs.findFirst({
      //       where: {
      //         sfpiId: data[1446].id,
      //         mod: 'FDPS_FPL',
      //         data: {
      //           contains: 'pointName'
      //         },
      //         time: {
      //           gte: logFirst.time
      //         }
      //       },
      //       select: {
      //         time: true,
      //         sfpiId: true,
      //         data: true
      //       }
      //     })
      //     console.log(logSecond);
          // const dataOnly = JSON.parse(logSecond.data)
                        
          // const matchPoint = (pointName) => {
          //   return sector.find(sectorItem => Object.values(sectorItem)[0].includes(pointName))
          // }
  
          // const dataWithSector = dataOnly.map(dataItem => {
          //   const sectorMatch = matchPoint(dataItem.pointName);
          //   return{
          //     ...dataItem,
          //     sector: sectorMatch ? Object.keys(sectorMatch)[0] : null
          //   }
          // })
          // newData.push(dataWithSector);
          // console.log(newData[0].length)
      /////////////////////////////////////////////////////////////////////////////////////////
      for(let i = 0 ; i < data.length ; i++){
        const logFirst = await prisma.logs.findFirst({
          where: {
            sfpiId: data[i].id,
            data: {
              contains: 'ACTIVE'
            }
          },
        });
                
        if(!logFirst){
          console.log(`missing logFirst ${p++}`)
          newData.push(null)
        }else{
          const logSecond = await prisma.logs.findFirst({
            where: {
              sfpiId: data[i].id,
              mod: 'FDPS_FPL',
              data: {
                contains: 'pointName'
              },
              time: {
                gte: logFirst.time
              }
            },
            select: {
              time: true,
              sfpiId: true,
              data: true
            }
          })
          
          // console.log(`data ke ${i} dengan id ${data[i].id}`)
          if(!logSecond || logSecond == null){
            console.log(`missing logSecond ${q++}`)
            continue;
          }else{
            const dataOnly = JSON.parse(logSecond.data)
                        
            const matchPoint = (pointName) => {
              return sector.find(sectorItem => Object.values(sectorItem)[0].includes(pointName))
            }
    
            const dataWithSector = dataOnly.map(dataItem => {
              const sectorMatch = matchPoint(dataItem.pointName);
              return{
                ...dataItem,
                sector: sectorMatch ? Object.keys(sectorMatch)[0] : null
              }
            })
            newData.push(dataWithSector);
            // if(newData[i].length){/////////////////////////////////////////INI MASALAHANYAAAAAAAA
            //   console.log(i)
            // }     
            if (newData[i] && newData[i].length) {
               console.log(`missing newData ${r++}`)
               console.log(`data ke ${i} adalah ${newData[i].length}`) 
                for(let j = 0 ; j < newData[i].length ; j++){
                  if(newData[i][j].sector != null && newData[i][j].time != null){
                    const takeReport = await prisma.report.findFirst({
                      where: {
                        sfpiId: data[i].id,
                        sector: newData[i][j].sector
                      }
                    })
                    // console.log(i)
                    if(!takeReport){
                      await prisma.report.create({
                        data: {
                          sfpiId: data[i].id,
                          sector: newData[i][j].sector,
                          time: new Date(new Date(newData[i][j].time).getTime() - new Date().getTimezoneOffset() * 60000),
                        }
                      })
                    }
                  }
                }
              }
            }
             
          // if(i=449){
          //   const dataOnly = JSON.parse(logSecond.data)
          //   const dataWithSector = dataOnly.map(dataItem => {
          //   const sectorMatch = matchPoint(dataItem.pointName);
          //     return{
          //       ...dataItem,
          //       sector: sectorMatch ? Object.keys(sectorMatch)[0] : null
          //     }
          //   })
                    
          //   newData.push(dataWithSector);
          //   console.log(dataOnly);
          //   break;
          // }
        }
      }

      const reportToday = await prisma.report.findMany({
        where: {
          time: {
            gte: targetDate, // Greater than or equal to the target date
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
          }
        },
        select: {
          sfpiId: true,
          sector: true,
          time: true
        },
      })

      // const reportToday = await prisma.report.groupBy({
      //   by: ['sector'],
      //   _count: true,
      //   where: {
      //     time: {
      //       gte: targetDate, // Greater than or equal to the target date
      //       lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
      //     }
      //   },
      // })
      

      // res.json(data);
      // res.json(reportToday);
      // Create a map to store the grouped data
      const groupedData = new Map();

      // Iterate through the data
      reportToday.forEach(entry => {
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
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}