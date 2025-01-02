const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const sector = require('../sector.json')

module.exports= {
  dataReport: async(req, res) => {
    // const targetDate = new Date('2023-07-12T00:00:00Z');
    const targetDate = new Date();
    targetDate.setUTCHours(0,0,0,0)
    try {
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

      const report = await prisma.report.findMany({
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
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}