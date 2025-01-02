const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const { Parser } = require('json2csv');
const fs = require('fs');
dayjs.extend(utc);

// const fic = async (day, month) => {
const fic = async (date) => {
  // const date = day < 10 ? `0${day}` : `${day}`
  // const monthUsed = month < 10 ? `0${month}` : `${month}`
  // const now = dayjs.utc(`2024-${monthUsed}-${date}`).startOf('day').toDate();
  const now = dayjs.utc(date).startOf('day').toDate();
  const tomorow = dayjs.utc(now).add(1, 'day').toDate();
  const com = ["27", "31"];
  const fic = [];

  const sfpi = await prisma.sfpis.findMany({
    where: {
      dateInit: {
        gte: now,
        lt: tomorow
      },
      log: {
        some: {
          mod: {
            in: com
          }
        }
      }
    },
    select: {
      id: true,
      callsign: true,
      adep: true,
      ades: true,
      log: {
        where: {
          mod: {
            in: com
          }
        },
        orderBy: {
          time: 'asc'
        },
        take: 1
      }
      // log: {
      //   select: {
      //     mod: true,
      //   },
      // }
    }
  })
  /**extract daata */
  // const json2csvParser = new Parser();
  // const csv = json2csvParser.parse(sfpi);
  // fs.writeFileSync('./FICGP170924.csv', csv);
  /**extract data */

  for(let i in sfpi){
    const data = {
      sfpiId : sfpi[i].id,
      sector : 'FIC',
      time : sfpi[i].log[0].time
    }
    fic.push(data);
  }
  return fic;
}
module.exports={fic}
// const run = async () => {
//   for(let month = 9 ; month <= 9 ; month++){
//     for(let day = 17; day<= 17 ; day++){
//       await dateInitFunc(day, month);
//     }
//   }
// }

// run()