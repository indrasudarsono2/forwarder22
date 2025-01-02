const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const sector = require('./sector.json')

//const targetDate = new Date('2024-02-27T00:00:00Z');
const targetDate = new Date();
targetDate.setUTCHours(0,0,0,0)
// console.log(sector[1]["APP"]);
const report = async() => {
  const data = await prisma.sfpis.findMany({
    where: {
      estTimeOfEntry: {
        gte: targetDate, // Greater than or equal to the target date
        lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than the next day
      },
    },
    select: {
      id: true,
      adep: true,
      ades: true,
    },
    orderBy: {
      estTimeOfEntry: 'asc'
    },
    // take: 10
  });
  // res.json(data);
  for(let i = 0 ; i <= data.length ; i++){
    if(i == data.length){
      // console.log('sukses');
    }else{
      const firstLog = await prisma.logs.findFirst({
        where: {
          sfpiId: data[i].id,
          data: {
            contains: 'ACTIVE'
          }
        },
      });
      // console.log(i);
      if(firstLog){
        const secondLog = await prisma.logs.findMany({
          where: {
            sfpiId: firstLog.sfpiId,
            mod: 'FDPS_FPL',
            data: {
              contains: 'pointName',
              not: {
                contains: 'null'
              }
            },
            time: {
              gte: firstLog.time
            }
          },
          select: {
            time:true,
            data: true,
          },
          orderBy: {
            id: 'desc'
          }
        })
        // res.json(secondLog);
        //////////////////SECOND FOR CARI DATA YANG PALING BANYAK DAN TIDAK ADA NULL
        if (secondLog.length !== 0) {
          const elementWithMaxData = secondLog.reduce((maxDataElement, currentElement) => {
              const maxData = JSON.parse(maxDataElement.data);
              const currentData = JSON.parse(currentElement.data);
        
              return maxData.length > currentData.length ? maxDataElement : currentElement;
            
          }, secondLog[0]);
          
          const dataOnly = JSON.parse(elementWithMaxData.data)
          const arroundJakarta = ['WIII', 'WIHH', 'WIRR', 'WICC', 'WICC']
          if(arroundJakarta.includes(data[i].adep) || arroundJakarta.includes(data[i].ades)){
            const acc = sector[0]["ACC"];
            const app = sector[1]["APP"];
            var sectorSelected = [...acc, ...app]
          }else{
            // console.log('outside jakarta');
            var sectorSelected = sector[0]["ACC"]
          }
      
          const matchPoint = (pointName) => {
            return sectorSelected.find(sectorItem => Object.values(sectorItem)[0].includes(pointName))
          }
  
          const dataWithSector = dataOnly.map(dataItem => {
            const sectorMatch = matchPoint(dataItem.pointName);
            return{
              ...dataItem,
              sector: sectorMatch ? Object.keys(sectorMatch)[0] : null
            }
          })
  
          const filteredDataWithSector = dataWithSector.filter(item => item.sector !== null);
          // res.json(filteredDataWithSector[0].sector)
          if(filteredDataWithSector.length !== 0){
            for(let j = 0 ; j < filteredDataWithSector.length ; j++){
              const takeReport = await prisma.report.findFirst({
                where: {
                  sfpiId: data[i].id,
                  sector : filteredDataWithSector[j].sector
                }
              })
              
              if(!takeReport || takeReport == null){
                await prisma.report.create({
                  data: {
                    sfpiId: data[i].id,
                    sector: filteredDataWithSector[j].sector,
                    time: new Date(new Date(filteredDataWithSector[j].time).getTime() - new Date().getTimezoneOffset() * 60000),
                  }
                })
              }else{
                continue;
              }
            }
          }else{
            continue;
          }
        }else{
          continue;
        }
      }
    }
  }
}

report();

  // console.log('oke');
