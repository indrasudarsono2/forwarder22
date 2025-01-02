const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const sector = require('../sector.json');
const cron = require('node-cron');

const go = async () => {
  const targetDate = dayjs.utc().startOf('day').toDate();
  const tomorow = dayjs.utc(targetDate).add(1, 'day').toDate();
  await report(targetDate, tomorow);
}

cron.schedule('*/20 * * * *', go);

async function report(targetDate, tomorow){
  const sfpiId = [];
  const log = await prisma.logs.findMany({
    where: {
      time: {
        gte: targetDate, // Greater than or equal to the target date
        lt: tomorow
      },
    },
  });

  for (let c = 0 ; c < log.length ; c++){
    if(!sfpiId.includes(log[c].sfpiId)){
      sfpiId.push(log[c].sfpiId);
    }
  }

  const data = await prisma.sfpis.findMany({
    where: {
      id: {
        in: sfpiId
      }
    },
    select: {
      id: true,
      callsign:true,
      adep: true,
      ades: true,
      requestedFlightLevel:true,
    },
    orderBy: {
      estTimeOfEntry: 'asc'
    },
    // take: 10
  });

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
           
      if(firstLog){
        const secondLog = await prisma.logs.findMany({
          where: {
            sfpiId: firstLog.sfpiId,
            mod: 'FDPS_FPL',
            OR: [
              {
                data: {
                  contains: 'Flown',
                  not: {
                    contains: 'null'
                  }
                },
                data: {
                  contains: 'Estimated'
                }
              }
            ],
            time: {
              gte: firstLog.time
            }
          },
          select: {
            time:true,
            data: true
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
          const altarCluster = ['WIKK', 'WIKT']
          if(arroundJakarta.includes(data[i].adep) || arroundJakarta.includes(data[i].ades)){
            const acc = sector[0]["ACC"];
            const app = sector[1]["APP"];
            var sectorSelected = [...acc, ...app]
            
          }else{
            if(data[i].requestedFlightLevel < 245 && !altarCluster.includes(data[i].ades) && !altarCluster.includes(data[i].adep)){
              const fic = sector[2];
              const gp = sector[3];
              var sectorSelected = [fic, gp];
          
            }else{          
              var sectorSelected = sector[0]["ACC"]
            }
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
              const now = dayjs.utc().toISOString();
              const takeReport = await prisma.report.findFirst({
                where: {
                  sfpiId: data[i].id,
                  sector : filteredDataWithSector[j].sector
                }
              })
              
              if(!takeReport || takeReport == null){
                const insert = await prisma.report.create({
                  data: {
                    sfpiId: data[i].id,
                    sector: filteredDataWithSector[j].sector,
                    time: new Date(new Date(filteredDataWithSector[j].time).getTime() - new Date().getTimezoneOffset() * 60000),
                  }
                })
                console.log(`${now} : insert -> ${dayjs.utc(insert.time).toISOString()}`);
              }else{
                const update = await prisma.report.update({
                  where: {
                    id: takeReport.id
                  },
                  data : {
                    time: new Date(new Date(filteredDataWithSector[j].time).getTime() - new Date().getTimezoneOffset() * 60000),
                  }
                });

                const sfpi = await prisma.sfpis.findFirst({
                  where: {
                    id: takeReport.sfpiId
                  }
                });
                const estTimeEnt = dayjs.utc(sfpi.estTimeOfEntry);
                const maxData = dayjs.utc(elementWithMaxData.time);
                const diff = estTimeEnt.diff(maxData, 'hour');

                if(sfpi.estTimeOfEntry == null || diff > 10 || diff < -10){
                  const updateSfpi = await prisma.sfpis.update({
                    where: {
                      id: takeReport.sfpiId
                    },
                    data: {
                      estTimeOfEntry: elementWithMaxData.time
                    }
                  })
                }
                console.log(`${now} : update -> ${dayjs.utc(update.time).toISOString()}`);
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
