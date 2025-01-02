const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { exec } = require('child_process');
const { readData } = require('./sector')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const hapus = async () => {
  try {
    const date = dayjs.utc("2024-11-13").startOf('day').toDate();
    const sfpiId= []
    const logs = await prisma.logs.findMany({
      where: {
        time: {
          gte: date,
          lt: dayjs.utc(date).add(1, 'day').toDate(),
        }
      }
    })
    
    for (i in logs){
      if(!sfpiId.includes(logs[i].sfpiId)){
        sfpiId.push(logs[i].sfpiId);
      }
    }
    
    const deleteMany = await prisma.sfpis.deleteMany({
      where: {
        id: {
          in: sfpiId
        }
      }
    })

    const referred = await prisma.referred.deleteMany({
      where: {
        id: {
          in: sfpiId
        }
      }
    })

    console.log(deleteMany);
  } catch (error) {
    console.log('error')
  }
}

hapus ();