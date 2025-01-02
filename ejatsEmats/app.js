const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const { Parser } = require('json2csv');
const fs = require('fs');
dayjs.extend(utc);

const run = async (day, month) => {
  const nowInit = dayjs.utc().startOf('day').toDate();
  const now = dayjs.utc(nowInit).subtract(91, 'days').startOf('day').toDate();
  const tomorow = dayjs.utc(now).add(90, 'day').toDate();
  const apt = ["WIII", "WIHH", "WIHP", "WIRR", "WICC"]
  
  const sfpi = await prisma.sfpis.findMany({
    where: {
      dateInit: {
        gte: now,
        lt: tomorow
      },
      OR: [
        {
          adep: {
            in: apt
          }
        },
        {
          ades: {
            in: apt
          }
        }
      ]
    },
    select: {
      callsign: true,
      adep: true,
      ades: true,
      departureTime: true,
      actualLandingTime: true,
      dateInit: true
    }
  })

  for(let i in sfpi){
    if(apt.includes(sfpi[i].ades)){
      sfpi[i]["Yang mengaktifkan"] = "EMAATS";
      if(sfpi[i].ades == "WIII"){
        sfpi[i]["Diaktifkan pada"] = dayjs.utc(sfpi[i].dateInit).subtract(50,'minutes').format('YYYY-MM-DD HH:mm:ss')
      }else{
        sfpi[i]["Diaktifkan pada"] = dayjs.utc(sfpi[i].dateInit).subtract(75,'minutes').format('YYYY-MM-DD HH:mm:ss')
      }
    }else if(apt.includes(sfpi[i].adep)){
      sfpi[i]["Yang mengaktifkan"] = "EJAATS";
      if(sfpi[i].departureTime != null){
        sfpi[i]["Diaktifkan pada"] = dayjs.utc(sfpi[i].departureTime).format('YYYY-MM-DD HH:mm:ss')
      }else{
        sfpi[i]["Diaktifkan pada"] = null
      }
    }else{
      sfpi[i]["Yang mengaktifkan"] = "NO";
      sfpi[i]["Diaktifkan pada"] = null
    }
    delete sfpi[i].departureTime;
    delete sfpi[i].actualLandingTime;
    delete sfpi[i].dateInit;
  }

  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(sfpi);
  fs.writeFileSync('app.csv', csv);
}

run ()