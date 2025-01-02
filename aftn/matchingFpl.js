const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const matchFpl = async (file) => {
  const creatingDof = (time) => {
    // const time = "2024-11-14 00:01:00" //TIME TAKE OFF
    const fullTime = dayjs.utc(`${time}`).toDate();
    const timePlus = dayjs.utc(time).add(1, 'day').startOf('day');
    const timeMin = dayjs.utc(time).subtract(1, 'day').startOf('day');
    const diff = timePlus.diff(dayjs.utc(time), 'minute');
    const getDateForMidNight = diff <= 30 ? dayjs.utc(timePlus).format('YYYY-MM-DD') : 
                                diff > 1394 ? dayjs.utc(timeMin).format('YYYY-MM-DD') : 
                                dayjs.utc(time).format('YYYY-MM-DD');
    
    
    const startDate = diff <= 30 ? dayjs.utc(getDateForMidNight).startOf('day').toDate() : dayjs.utc(time).format('YYYY-MM-DD');
    const toleranceBefore = dayjs.utc(startDate).subtract(30, 'hour').toDate();
    const toleranceAfter = dayjs.utc(startDate).add(45, 'minute').toDate();
    
    if(toleranceBefore <= fullTime && fullTime <= toleranceAfter){
      var dofSelected = [getDateForMidNight, dayjs.utc(time).format('YYYY-MM-DD')];
    }else{
      var dofSelected = [getDateForMidNight];
    }
    return dofSelected
  }

  if(file.fieldsData.departureTime != null){
    const dof = creatingDof(file.fieldsData.departureTime)
    const dofUsed = [];
    for(let j in dof){
      const date = dayjs.utc(dof[j]).toDate();
      dofUsed.push(date);
    }
  
    const fpl = await prisma.aftn.findMany({
      where: {
        msgType: "FPL",
        sfpiId: null,
        callsign: file.fieldsData.callsign,
        adep: file.fieldsData.adep,
        ades: file.fieldsData.ades,
        dof: {
          in: dofUsed
        },
      },
      orderBy: {
        timeInputed: 'desc'
      }
    });   
  
    if(fpl.length != 0){
      for(k in fpl){
        await prisma.aftn.update({
          where: {
            id: fpl[k].id
          },
          data: {
            sfpiId: String(file.fieldsData.sfpi),
            isJatsc: true
          }
        })
      }
      
      const regexFilterFpl = /\((?<typMsg>\w{3})-(?<callsign>\w+)[\s\S]*?\n[\s\S]*?\n-(?<adep>\w{4})(?<eobt>\d{4})\s*-\w* (?<route>[\s\S]*?)(?=-)-(?<ades>\w{4})(?<eat>\d{4})( (?<altn>[\w ]*))?\s*-[\w\S\s]*DOF\/(?<dof>\d{6})\s*(REG\/(?<areg>\w*)[\w\S\s]*\))?/gm
      const regexChangeRow = /\s{2}/gm;
      console.log(fpl[0].id);
      const message = fpl[0].message;
      
      if(message){
        regexFilterFpl.lastIndex = 0
        const exec = regexFilterFpl.exec(message);
        var { route } = exec.groups
        if(regexChangeRow.test(route)){
         route = route.replace(/\s{2}/gm, " ");
        }
  
        await prisma.sfpis.update({
          where: {
            id: String(file.fieldsData.sfpi)
          },
          data: {
            dof: fpl[0].dof,
            route: route
          }
        })
        console.log(`Route input for ${file.fieldsData.sfpi} ${file.fieldsData.callsign}`)
      }
    }
  } 
}
  
module.exports={ matchFpl }