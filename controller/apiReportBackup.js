const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const sector = require('../sector.json')

module.exports = {
  dataReport: async(req, res) => {
    // const targetDate = new Date('2023-07-12T00:00:00Z');
    const targetDate = new Date();
    targetDate.setUTCHours(0,0,0,0)
    // console.log(targetDate);
    try {
      const newData = []
      
      ///////////////////////////////////////testing/////////////////////////////////////////////////////////////////////////////
      // const data = await prisma.sfpis.findMany({
      //   where: {
      //     estTimeOfEntry: {
      //       gte: targetDate, // Greater than or equal to the target date
      //       lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
      //     },
      //     // id: '16682769'
      //   },
      //   select: {
      //     id: true,
      //     callsign:true,
      //   },
      //   orderBy: {
      //     estTimeOfEntry: 'asc'
      //   },
      // });
      // // res.json(data[293])
      
      // const logFirst = await prisma.logs.findFirst({
      //       where: {
      //         sfpiId: data[293].id,
      //         data: {
      //           contains: 'ACTIVE'
      //         }
      //       },
      //       select:{
      //         id:true,
      //         sfpiId:true,
      //         time:true
      //       }
      //     });
      
      //     const logSecond = await prisma.logs.findMany({
      //             where: {
      //               sfpiId: data[293].id,
      //               mod: 'FDPS_FPL',
      //               data: {
      //                 contains: 'pointName'
      //               },
      //               time: logFirst.time
      //             },
      //             select: {
      //               time: true,
      //               sfpiId: true,
      //               data: true
      //             },
      //             orderBy: {
      //               id: 'desc'
      //             }
      //           })
      //     console.log(logSecond);
      //     if(logSecond.length==0){
      //       console.log('null dalem');
      //     }
      //           const dataOnly = JSON.parse(logSecond[0].data)
      //           res.json(dataOnly);
                        
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
/////////////////////////////////////////testing/////////////////////////////////////////////////



      const data = await prisma.sfpis.findMany({
        where: {
          estTimeOfEntry: {
            gte: targetDate, // Greater than or equal to the target date
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
          },
          // id: '16683287'
        },
        select: {
          id: true,
          callsign:true,
        },
        orderBy: {
          estTimeOfEntry: 'asc'
        },
      });

      for(let i = 0 ; i < data.length ; i++){
        // console.log(i);
        // const logFirst = await prisma.logs.findFirst({
        //   where: {
        //     sfpiId: data[i].id,
        //     data: {
        //       contains: 'ACTIVE'
        //     }
        //   },
        //   select:{
        //     id:true,
        //     sfpiId:true,
        //     time:true
        //   }
        // });

        // if(!logFirst){
        //   newData.push(null)
        // }else{
        //   const logSecond = await prisma.logs.findMany({
        //     where: {
        //       sfpiId: data[i].id,
        //       mod: 'FDPS_FPL',
        //       data: {
        //         contains: 'pointName'
        //       },
        //       time: logFirst.time
        //     },
        //     select: {
        //       time: true,
        //       sfpiId: true,
        //       data: true
        //     },
        //     orderBy: {
        //       id: 'desc'
        //     }
        //   })

          const logFirst = await prisma.logs.findFirst({
            where: {
              sfpiId: data[i].id,
              data: {
                contains: 'ACTIVE'
              }
            },
          });
                  
          if(!logFirst){
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
          // if(logSecond.length == 0 || !logSecond || logSecond == null || !logSecond[0].data){
          if(!logSecond || logSecond == null){
            continue;
          }else{
            const dataOnly = JSON.parse(logSecond.data)
            console.log(`data ke ${i} logSecond sukses`)
                        
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
              
            if (newData[i] && newData[i].length) {
              //  console.log(`data ke ${i} adalah ${newData[i].length}`) 
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