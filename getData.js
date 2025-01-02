const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const date = dayjs.utc('2024-03-22').format();
const tomorow = dayjs.utc(date).add(1, 'day').format()
const regex = /^ --> \w*$/;

const getData = async () => {
  try {
    const calculateDuration = (start, end) => {
      const startTime = dayjs.utc(start);
      const endTime = dayjs.utc(end);
      const duration = endTime.diff(startTime, 'minute');
      return duration;
    }

    const sectorLog = await prisma.sectorLogs.findMany({
      where:{
        sfpiId: '17050910',
        isEntry: true,
        time: {
          gte: date,
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
      }
    });

    for(let j = 0 ; j < sectorLog.length ; j++){
      if(j == sectorLog.length-1){
        console.log(sectorLog[j].time)
        const lastTime= dayjs.utc(sectorLog[j].time).format()
        const lastLog = await prisma.sectorLogs.findFirst({
          where: {
            sfpiId: sectorLog[j].sfpiId,
            time: {
              gt: lastTime
            }
          }
        })
        if(lastLog){
          var nextTime =lastLog.time;
        }
      }else{
        var nextTime = sectorLog[j+1].time;
      }

      const currentTime = sectorLog[j].time;
      const duration = calculateDuration(currentTime, nextTime)
      sectorLog[j].duration = duration
    }
    console.log(sectorLog);

  } catch (error) {
    console.log(error);
  }
}
// console.log(tomorow);
getData();