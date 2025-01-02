const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const { Parser } = require('json2csv');
const fs = require('fs');
const sector = require ('./sector.json')
dayjs.extend(utc);

const run = async (day, month) => {
  const sfpiId = [];
  const emaats = [];
  const ejaats = [];
  const non = [];
  const date = day < 10 ? `0${day}` : `${day}`
  const monthUsed = month < 10 ? `0${month}` : `${month}`
  const nowInit = dayjs.utc().startOf('day').toDate();
  const now = dayjs.utc(nowInit).subtract(91, 'days').startOf('day').toDate();
  const yesterday = dayjs.utc(now).add(90, 'day').toDate();
  
  const getSector = ["UBAC", "UMDN", "UPKU", "UIOS"]
  const getSector2 = ["UBAC", "UMDN", "UPKU", "UIOS", "UPLB", "UJKT"]
  const report = await prisma.report.findMany({
    where: {
      sector: {
        in: getSector
      },
      time: {
        gte: now,
        lt: yesterday
      }
    }
  });

  for(let i in report){
    if(!sfpiId.includes(report[i].sfpiId)){
      sfpiId.push(report[i].sfpiId)
    }
  }

  const sfpi = await prisma.sfpis.findMany({
    where: {
      id: {
        in: sfpiId
      }
    },
    select: {
      callsign: true,
      adep: true,
      ades: true,
      report: {
        where: {
          sector: {
            in: getSector2
          }
        },
        orderBy: {
          id: 'asc'
        },
        select: {
          sector: true,
          time: true
        }
      }
    }
  });
  
  const west = ["WIT??", "WIM?", "WIE?", "O???", "V???"]
  const east = ["WIII", "WIH?", "WIC?", "WIL?", "WIP?", "WA??", "Y???", "N???"]
  const regexWest = new RegExp(west.join('|').replace(/\?/g, '.'))
  const regexEast = new RegExp(east.join('|').replace(/\?/g, '.'))

  for (let j in sfpi){
    if(regexEast.test(sfpi[j].adep)){
      sfpi[j]["Yang mengaktifkan"] = "EMAATS";
      if(sfpi[j].report[0].sector == "UPLB"){
        const timeEntry = dayjs.utc(sfpi[j].report[0].time).add(15,'minutes');
        sfpi[j]["Diaktifkan pada"] = dayjs.utc(timeEntry).format('YYYY-MM-DD HH:mm:ss')
      }else{
        sfpi[j]["Diaktifkan pada"] = dayjs.utc(sfpi[j].report[0].time).format('YYYY-MM-DD HH:mm:ss')
      }
      delete sfpi[j].report
      emaats.push(sfpi[j]);
    }else if(regexEast.test(sfpi[j].ades)){
      sfpi[j]["Yang mengaktifkan"] = "EJAATS";
      if(sfpi[j].report[sfpi[j].report.length-1].sector == "UJKT"){
        const timeEntry = dayjs.utc(sfpi[j].report[sfpi[j].report.length-1].time).subtract(40,'minutes');
        sfpi[j]["Diaktifkan pada"] = dayjs.utc(timeEntry).format('YYYY-MM-DD HH:mm:ss')
      }else{
        sfpi[j]["Diaktifkan pada"] = dayjs.utc(sfpi[j].report[sfpi[j].report.length-1].time).format('YYYY-MM-DD HH:mm:ss');
      }
      delete sfpi[j].report
      ejaats.push(sfpi[j]);
    }else{
      sfpi[j]["Yang mengaktifkan"] = "NO"
      sfpi[j]["Diaktifkan pada"] = dayjs.utc(sfpi[j].report[0].time).format('YYYY-MM-DD HH:mm:ss')
      delete sfpi[j].report
      non.push(sfpi[j]);
    }
  }
//   console.log(`All : ${sfpi.length}. EMAATS : ${emaats.length}. EJAATS : ${ejaats.length}`)
  // const string = JSON.stringify(sfpi, 0, 1);
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(sfpi);
  fs.writeFileSync('json.csv', csv);
}

// const yess = async () => {
//   const allData=[]
//   for(let month = 5 ; month <= 8 ; month++){
//     for(let day = 1; day <= 3 ; day++){
//       const data = await run(day, month);
//       allData.push(...data);
//       // console.log(data);
//     }
//   }
  
//   const json2csvParser = new Parser();
//   const csv = json2csvParser.parse(allData);
//   fs.writeFileSync('json.csv', csv);
// }

run();