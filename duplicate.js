const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const { Parser } = require('json2csv');
dayjs.extend(utc);


const coba = async () => {

  const duplicate = []
  
  for(let tgl = 1 ; tgl <=2 ; tgl++){
    const day = tgl < 1 ? `0${tgl}` : `${tgl}`;
    const sfpiId = []
    const date = dayjs.utc(`2024-06-${day}`).toDate();
    const tomorow = dayjs.utc(date).add(1, 'day').toDate();
    const regex = /\w{4}\d{4}/gm
    
    const aftn = await prisma.aftnmessage.findMany({
      where: {
        tanggal: date
      }
    })
  
    const log = await prisma.logs.findMany({
      where: {
        time: {
          gte: date,
          lt: tomorow
        }
      },
      select: {
        sfpi: {
          select: {
            callsign: true
          }
        },
        sfpiId: true
      }
    })
  
    for(i in log){
      if(!sfpiId.includes(log[i].sfpiId)){
        sfpiId.push(log[i].sfpiId)
      }
    }
  
   const sfpi = await prisma.sfpis.findMany({
      where:{
        id: {
          in: sfpiId
        }
      }
    })
    
    for(j in sfpi){
      const filter = aftn.filter(data => data.msg.includes(`(FPL-${sfpi[j].callsign}`));
      const data = {}
      
      if(!filter.length){
        continue;
      }else{
        if (filter.length > 1){
          for(k in filter){
            const match = filter[k].msg.match(regex);
            if(match){
              const adep = match[0].slice(0,4);
              const ades = match[1].slice(0,4)
              if(adep == sfpi[j].adep && ades == sfpi[j].ades){
                if(!data["callsign"]){
                  data["date"] = dayjs.utc("2024-06-01").format("DD-MM-YYYY")
                  data["callsign"] = sfpi[j].callsign
                  data["opr"] = sfpi[j].callsign.slice(0,3)
                  data["numbOfDuplicate"] = 1
                  data["flightPlan"] = [filter[k]]
                }else{
                  data["flightPlan"].push(filter[k])
                  data["numbOfDuplicate"]++
                }
              }
            }
          }
          if(data.numbOfDuplicate > 1){
            duplicate.push(data)
          }
        }
      }
    }
  }
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(duplicate);
  fs.writeFileSync('./duplicate.csv', csv); 
}

coba();