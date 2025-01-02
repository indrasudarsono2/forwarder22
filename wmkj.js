const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const wmkj = async () => {
  const grab = [];
  const point = ["MIBEL", "TAROS", "TUSNU"]
  const data = await prisma.sfpis.findMany({
    where: {
      ades: 'WMKJ',
    },
    select: {
      id: true,
      callsign: true,
      adep: true,
      ades: true,
      logPath: {
        orderBy: {
          numWaypoints: 'desc'
        },
        take: 1
      }
    }
  })

  for(let i in data){
    if (data[i].logPath.length != 0){
      const json = JSON.parse(data[i].logPath[0].paths)
      for(let j in json){
        if(point.includes(json[j].pointName)){
          grab.push(data[i].id)
        }
      }
    }
  }
  console.log(grab);
}

wmkj()