const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const runFpl = async () => {
  const now = dayjs.utc().toDate();
  // const start = dayjs.utc(now).subtract(5, 'minutes').toDate();
  const start = dayjs.utc(now).add(60, 'minutes').toDate();
  const end = dayjs.utc(now).add(120, 'minutes').toDate();
  
  const sfpi = await prisma.sfpis.findMany({
    where: {
      departureTime: {
        gte: start,
        lt: end
      }
    }
  })
  
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

  for(let i in sfpi){
    const dof = creatingDof(sfpi[i].departureTime)
    const dofUsed = [];
    for(let j in dof){
      const date = dayjs.utc(dof[j]).toDate();
      dofUsed.push(date);
    }

    const fpl = await prisma.aftn.findMany({
      where: {
        msgType: "FPL",
        sfpiId: null,
        callsign: sfpi[i].callsign,
        adep: sfpi[i].adep,
        ades: sfpi[i].ades,
        dof: {
          in: dofUsed
        },
      },
      orderBy: {
        timeInputed: 'desc'
      }
    });   

    if(fpl){
      for(k in fpl){
        await prisma.aftn.update({
          where: {
            id: fpl[k].id
          },
          data: {
            sfpiId: String(sfpi[i].id)
          }
        })
      }
      
      const regexFilterFpl = /\((?<typMsg>\w{3})-(?<callsign>\w+)[\s\S]*?\n[\s\S]*?\n-(?<adep>\w{4})(?<eobt>\d{4})\s*-\w* (?<route>[\s\S]*?)(?=-)-(?<ades>\w{4})(?<eat>\d{4})( (?<altn>[\w ]*))?\s*-[\w\S\s]*DOF\/(?<dof>\d{6})\s*(REG\/(?<areg>\w*)[\w\S\s]*\))?/gm
      const message = fpl[0].message;

      regexFilterFpl.lastIndex = 0
      const exec = regexFilterFpl.exec(message);
      const { route } = exec.groups
      
      await prisma.sfpis.update({
        where: {
          id: sfpi[i].id
        },
        data: {
          dof: fpl[0].dof,
          route: route
        }
      })
    }
    console.log(sfpi[i]);     
    break ;
  }
}

const runDep = async () => {
  const now = dayjs.utc().toDate();
  const before = dayjs.utc(now).subtract(10, 'minutes').toDate();
  const longBefore = dayjs.utc(now).subtract(10, 'days').toDate();
  const start = dayjs.utc("2024-12-01 00:00:00").toDate();
  const stop = dayjs.utc(start).add(3, 'days').toDate();
  // const longBefore = dayjs.utc(now).subtract(12, 'hours').toDate();
  const aftnDep = await prisma.aftn.findMany({
    where:{
      timeInputed: {
        // gte: before,
        // gte: longBefore,
        // lt: now,
        gte: start,
        lt: stop
      },
      // callsign: "THY057",
      isVerified: true,
      // sfpiId: null,
      msgType: "DEP",
    }
  })
  
  var no = 1;
  for (let i in aftnDep){
    /**MAKE IS VERIFIED TRUE */
  //   const regexFilterDep = /\(\w*-(?<callsign>\w*)(\/\w*)?-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w{4})(?:\s*)?-(?:DOF\/)?(?<dof>\d+)\)/gm;
  //   const regexRealDof = /(?<year>\d{2})(?<month>\d{2})(?<day>\d{2})/gm
  //   const exec = regexFilterDep.exec(aftnDep[i].message);
  //   if(exec){
  //     var { dof, callsign, adep, ades } = exec.groups;
  //     const execRealDof = regexRealDof.exec(dof);
  //     if(execRealDof){
  //       const {year, month, day} = execRealDof.groups;
  //       const dateSelected = `20${year}-${month}-${day}`
  //       dof = dayjs.utc(dateSelected).startOf('day').toDate();
  //     }else if(dof == 0){
  //       dof = null
  //     }

  //     await prisma.aftn.update({
  //       where: {
  //         id: aftnDep[i].id
  //       },
  //       data: {
  //         dof: dof,
  //         callsign: callsign,
  //         adep: adep,
  //         ades: ades,
  //         isVerified: true
  //       }
  //     })
  //     console.log(`${callsign} --> ${no} of ${aftnDep.length}`)
  //     no++
  //   }
  // }
  /**--------------------------------------------------------------------- */

  /**MATCHING TO SFPL */
    if(aftnDep[i].dof == null || aftnDep[i].dof == 0 ){
      const timeInputedDof = dayjs.utc(aftnDep[i].timeInputed).subtract(20, 'hours').toDate();
      var fpl = await prisma.aftn.findMany({
        where: {
          timeInputed: {
            gte: timeInputedDof,
            lt: dayjs.utc(aftnDep[i].timeInputed).toDate()
          },
          callsign: aftnDep[i].callsign,
          adep: aftnDep[i].adep,
          ades: aftnDep[i].ades,
          msgType: "FPL",
          // isJatsc: true
        },
        orderBy: {
          timeInputed: 'desc'
        }
      })
    }else{
      var fpl = await prisma.aftn.findMany({
        where: {
          callsign: aftnDep[i].callsign,
          adep: aftnDep[i].adep,
          ades: aftnDep[i].ades,
          dof: dayjs.utc(aftnDep[i].dof).toDate(),
          msgType: "FPL",
          // isJatsc: true
        },
        orderBy: {
          timeInputed: 'desc'
        }
      })
    }
   
    if(fpl.length != 0){
      const dofSel = aftnDep[i].dof == null || aftnDep[i].dof == 0 ? 
                      dayjs.utc(fpl[0].dof).toDate() : 
                      dayjs.utc(aftnDep[i].dof).toDate();
      await prisma.aftn.update({
        where: {
          id: aftnDep[i].id
        },
        data: {
          sfpiId: fpl[0].sfpiId,
          isJatsc: fpl[0].isJatsc,
          dof: dofSel
        }
      })
      console.log(`${aftnDep[i].callsign} DEP--> ${no} of ${aftnDep.length}`)
      no++;
    }
  }
    /**---------------------------------------------------------------------------------------- */
}

const runDla = async() => {
  const now = dayjs.utc().toDate();
  const before = dayjs.utc(now).subtract(10, 'minutes').toDate();
  const longBefore = dayjs.utc(now).subtract(10, 'days').toDate();
  const start = dayjs.utc("2024-12-01 00:00:00").toDate();
  const stop = dayjs.utc(start).add(3, 'days').toDate();
  // const longBefore = dayjs.utc(now).subtract(12, 'hours').toDate();
  const aftnDla = await prisma.aftn.findMany({
    where:{
      timeInputed: {
        // gte: before,
        // gte: longBefore,
        // lt: now
        gte: start,
        lt: stop
      },
      // callsign: "THY057",
      isVerified: true,
      // sfpiId: null,
      msgType: "DLA",
    }
  })

  var no = 1;
  for (let i in aftnDla){
    if(aftnDla[i].dof == null || aftnDla[i].dof == 0 ){
      const timeInputedDof = dayjs.utc(aftnDla[i].timeInputed).subtract(20, 'hours').toDate();
      var fpl = await prisma.aftn.findMany({
        where: {
          timeInputed: {
            gte: timeInputedDof,
            lt: dayjs.utc(aftnDla[i].timeInputed).toDate()
          },
          callsign: aftnDla[i].callsign,
          adep: aftnDla[i].adep,
          ades: aftnDla[i].ades,
          msgType: "FPL",
          // isJatsc: true
        },
        orderBy: {
          timeInputed: 'desc'
        }
      })
    }else{
      var fpl = await prisma.aftn.findMany({
        where: {
          callsign: aftnDla[i].callsign,
          adep: aftnDla[i].adep,
          ades: aftnDla[i].ades,
          dof: dayjs.utc(aftnDla[i].dof).toDate(),
          msgType: "FPL",
          // isJatsc: true
        },
        orderBy: {
          timeInputed: 'desc'
        }
      })
    }
   
    if(fpl.length != 0){
      const dofSel = aftnDla[i].dof == null || aftnDla[i].dof == 0 ? 
                      dayjs.utc(fpl[0].dof).toDate() : 
                      dayjs.utc(aftnDla[i].dof).toDate();
      await prisma.aftn.update({
        where: {
          id: aftnDla[i].id
        },
        data: {
          sfpiId: fpl[0].sfpiId,
          isJatsc: fpl[0].isJatsc,
          dof: dofSel
        }
      })
      console.log(`${aftnDla[i].callsign} DLA--> ${no} of ${aftnDla.length}`)
      no++;
    }
  }
}

const runCnl = async() => {
  const now = dayjs.utc().toDate();
  const before = dayjs.utc(now).subtract(10, 'minutes').toDate();
  const longBefore = dayjs.utc(now).subtract(10, 'days').toDate();
  const start = dayjs.utc("2024-12-01 00:00:00").toDate();
  const stop = dayjs.utc(start).add(3, 'days').toDate();
  // const longBefore = dayjs.utc(now).subtract(12, 'hours').toDate();
  const aftnCnl = await prisma.aftn.findMany({
    where:{
      timeInputed: {
        // gte: before,
        // gte: longBefore,
        // lt: now
        gte: start,
        lt: stop
      },
      // callsign: "THY057",
      isVerified: true,
      // sfpiId: null,
      msgType: "CNL",
    }
  })

  var no = 1;
  for (let i in aftnCnl){
    if(aftnCnl[i].dof == null || aftnCnl[i].dof == 0 ){
      const timeInputedDof = dayjs.utc(aftnCnl[i].timeInputed).subtract(20, 'hours').toDate();
      var fpl = await prisma.aftn.findMany({
        where: {
          timeInputed: {
            gte: timeInputedDof,
            lt: dayjs.utc(aftnCnl[i].timeInputed).toDate()
          },
          callsign: aftnCnl[i].callsign,
          adep: aftnCnl[i].adep,
          ades: aftnCnl[i].ades,
          msgType: "FPL",
          // isJatsc: true
        },
        orderBy: {
          timeInputed: 'desc'
        }
      })
    }else{
      var fpl = await prisma.aftn.findMany({
        where: {
          callsign: aftnCnl[i].callsign,
          adep: aftnCnl[i].adep,
          ades: aftnCnl[i].ades,
          dof: dayjs.utc(aftnCnl[i].dof).toDate(),
          msgType: "FPL",
          // isJatsc: true
        },
        orderBy: {
          timeInputed: 'desc'
        }
      })
    }
    
    if(fpl.length != 0){
      const dofSel = aftnCnl[i].dof == null || aftnCnl[i].dof == 0 ? 
                      dayjs.utc(fpl[0].dof).toDate() : 
                      dayjs.utc(aftnCnl[i].dof).toDate();
      await prisma.aftn.update({
        where: {
          id: aftnCnl[i].id
        },
        data: {
          sfpiId: fpl[0].sfpiId,
          isJatsc: fpl[0].isJatsc,
          dof: dofSel
        }
      })
      console.log(`${aftnCnl[i].callsign} CNL--> ${no} of ${aftnCnl.length}`)
      no++;
    }
  }
}

const runChg = async () => {
  const now = dayjs.utc().toDate();
  const before = dayjs.utc(now).subtract(10, 'minutes').toDate();
  const longBefore = dayjs.utc(now).subtract(15, 'days').toDate();
  const start = dayjs.utc("2024-12-01 00:00:00").toDate();
  const stop = dayjs.utc(start).add(3, 'days').toDate();
  // const longBefore = dayjs.utc(now).subtract(12, 'hours').toDate();
  const aftnChg = await prisma.aftn.findMany({
    where:{
      timeInputed: {
        // gte: before,
        // gte: longBefore,
        // lt: now,
        gte: start,
        lt: stop
      },
      // callsign: "THY057",
      isVerified: true,
      // sfpiId: null,
      msgType: "CHG",
    }
  })
  const regexFilterChg = /\(\w*-(?<callsign>\w*)-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w*)-(?<dof>[\w\S]*)-(?<content>[\w\W]*)\)/gm
  const regexRoute = /15\/\w* (?<route>[\w\W]*)-[\w\S\W]*/gm

  var no = 1;
  for (let i in aftnChg){
    if(aftnChg[i].dof == null || aftnChg[i].dof == 0 ){
      const timeInputedDof = dayjs.utc(aftnChg[i].timeInputed).subtract(20, 'hours').toDate();
      var fpl = await prisma.aftn.findMany({
        where: {
          timeInputed: {
            gte: timeInputedDof,
            lt: dayjs.utc(aftnChg[i].timeInputed).toDate()
          },
          callsign: aftnChg[i].callsign,
          adep: aftnChg[i].adep,
          ades: aftnChg[i].ades,
          msgType: "FPL",
          // isJatsc: true
        },
        orderBy: {
          timeInputed: 'desc'
        }
      })
    }else{
      var fpl = await prisma.aftn.findMany({
        where: {
          callsign: aftnChg[i].callsign,
          adep: aftnChg[i].adep,
          ades: aftnChg[i].ades,
          dof: dayjs.utc(aftnChg[i].dof).toDate(),
          msgType: "FPL",
          // isJatsc: true
        },
        orderBy: {
          timeInputed: 'desc'
        }
      })
    }
    
    if(fpl.length != 0){
      const dofSel = aftnChg[i].dof == null || aftnChg[i].dof == 0 ? 
                      dayjs.utc(fpl[0].dof).toDate() : 
                      dayjs.utc(aftnChg[i].dof).toDate();
      await prisma.aftn.update({
        where: {
          id: aftnChg[i].id
        },
        data: {
          sfpiId: fpl[0].sfpiId,
          isJatsc: fpl[0].isJatsc,
          dof: dofSel
        }
      })
      
      const exec = regexFilterChg.exec(aftnChg[i].message);
      
      if(exec){
        const content = exec.groups.content;
        const exec2 = regexRoute.exec(content);
        if(exec2){
          var route = exec2.groups.route
          route = route.replace(/\s{2}/gm, " ");
          if(fpl[0].sfpiId != null){
            await prisma.sfpis.update({
              where: {
                id: fpl[0].sfpiId
              },
              data: {
                route: route
              }
            })
          }
        }
      }

      console.log(`${aftnChg[i].callsign} CHG--> ${no} of ${aftnChg.length}`)
      no++;
    }
  }
}

const runArr = async() => {
  const now = dayjs.utc().toDate();
  // const before = dayjs.utc(now).subtract(50, 'minutes').toDate();
  const longBefore = dayjs.utc(now).subtract(10, 'days').toDate();
  // const longBefore = dayjs.utc(now).subtract(7, 'hours').toDate();
  const start = dayjs.utc("2024-12-01 00:00:00").toDate();
  const stop = dayjs.utc(start).add(3, 'days').toDate();
  const aftnArr = await prisma.aftn.findMany({
    where:{
      timeInputed: {
        // gte: before,
        // gte: longBefore,
        // lt: now
        gte: start,
        lt: stop
      },
      // callsign: "SJV857",
      // isVerified: false,
      isVerified: true,
      // sfpiId: null,
      // ades: "WIII",
      msgType: "ARR",
    }
  })
  var no = 1;

  for (let i in aftnArr){
    /**MAKE IS VERIFIED TRUE */
  //   const regexFilterArr = /\(\w*-(?<callsign>\w*)(\/\w*)?-(?<adep>\w{4})(?<dep>\d{4})?-(?<ades>\w{4})(?<arr>\d{4})(?:\s*.*)?\)/gm
  //   const regexRealDof = /(?<year>\d{2})(?<month>\d{2})(?<day>\d{2})/gm
  //   const exec = regexFilterArr.exec(aftnArr[i].message);
  //   if(exec){
  //     var { dof, callsign, adep, ades } = exec.groups;
  //     const execRealDof = regexRealDof.exec(dof);
  //     if(execRealDof){
  //       const {year, month, day} = execRealDof.groups;
  //       const dateSelected = `20${year}-${month}-${day}`
  //       dof = dayjs.utc(dateSelected).startOf('day').toDate();
  //     }else if(dof == 0){
  //       dof = null
  //     }

  //     await prisma.aftn.update({
  //       where: {
  //         id: aftnArr[i].id
  //       },
  //       data: {
  //         dof: dof,
  //         callsign: callsign,
  //         adep: adep,
  //         ades: ades,
  //         isVerified: true
  //       }
  //     })
  //     console.log(`${callsign} --> ${no} of ${aftnArr.length}`)
  //     no++
  //   }
  /**--------------------------------------------------------------------- */
    if(aftnArr[i].dof == null || aftnArr[i].dof == 0 ){
      const timeInputedDof = dayjs.utc(aftnArr[i].timeInputed).subtract(20, 'hours').toDate();
      var fpl = [];
      var dep = await prisma.aftn.findMany({
        where: {
          timeInputed: {
            gte: timeInputedDof,
            lt: dayjs.utc(aftnArr[i].timeInputed).toDate()
          },
          callsign: aftnArr[i].callsign,
          adep: aftnArr[i].adep,
          ades: aftnArr[i].ades,
          msgType: "DEP",
          // isJatsc: true
        },
        orderBy: {
          timeInputed: 'desc'
        }
      })
      if(dep.length == 0){
        fpl = await prisma.aftn.findMany({
          where: {
            timeInputed: {
              gte: timeInputedDof,
              lt: dayjs.utc(aftnArr[i].timeInputed).toDate()
            },
            callsign: aftnArr[i].callsign,
            adep: aftnArr[i].adep,
            ades: aftnArr[i].ades,
            msgType: "FPL",
            // isJatsc: true
          },
          orderBy: {
            timeInputed: 'desc'
          }
        })
      }
    }else{
      var fpl = [];
      var dep = await prisma.aftn.findMany({
        where: {
          callsign: aftnArr[i].callsign,
          adep: aftnArr[i].adep,
          ades: aftnArr[i].ades,
          dof: dayjs.utc(aftnArr[i].dof).toDate(),
          msgType: "DEP",
          // isJatsc: true
        },
        orderBy: {
          timeInputed: 'desc'
        }
      });
      if(dep.length == 0){
        fpl = await prisma.aftn.findMany({
          where: {
            callsign:  aftnArr[i].callsign,
            adep:  aftnArr[i].adep,
            ades:  aftnArr[i].ades,
            dof: dayjs.utc( aftnArr[i].dof).toDate(),
            msgType: "FPL",
            // isJatsc: true
          },
          orderBy: {
            timeInputed: 'desc'
          }
        })
      }
    }
    
    if(dep.length != 0){
      await prisma.aftn.update({
        where: {
          id: aftnArr[i].id
        },
        data: {
          sfpiId: dep[0].sfpiId,
          isJatsc: dep[0].isJatsc,
          dof: dep[0].dof
        }
      })
      console.log(`${aftnArr[i].callsign} ARR--> ${no} of ${aftnArr.length}`)
      no++;
    }else if(dep.length == 0 && fpl.length != 0){
      await prisma.aftn.update({
        where: {
          id: aftnArr[i].id
        },
        data: {
          sfpiId: fpl[0].sfpiId,
          isJatsc: fpl[0].isJatsc,
          dof: fpl[0].dof
        }
      })
      console.log(`${aftnArr[i].callsign} ARR--> ${no} of ${aftnArr.length}`)
      no++;
    }
  }
}

const lastFpl = async()=> {
  const now = dayjs.utc().toDate();
  // const before = dayjs.utc(now).subtract(50, 'minutes').toDate();
  const longBefore = dayjs.utc(now).subtract(10, 'days').toDate();
  // const longBefore = dayjs.utc(now).subtract(20, 'hours').toDate();
  const fpl = await prisma.aftn.findMany({
    where:{
      timeInputed: {
        // gte: before,
        gte: longBefore,
        lt: now
      },
      // callsign: "T7PTL",
      // isVerified: false,
      isVerified: true,
      sfpiId: null,
      // ades: "WIII",
      msgType: "FPL",
    }
  })
  
  var no = 1;

  for(let i in fpl){
    const fpl1 = await prisma.aftn.findMany({
      where: {
        timeInputed: {
          gte: dayjs.utc(fpl[i].timeInputed).subtract(20, 'hours').toDate(),
          lt: dayjs.utc(fpl[i].timeInputed).toDate()
        },
        isVerified: true,
        callsign: fpl[i].callsign,
        adep: fpl[i].adep,
        ades: fpl[i].ades,
        dof: dayjs.utc(fpl[i].dof).toDate(),
        sfpiId: {
          not: null
        },
        msgType: "FPL",
      },
      orderBy: {
        timeInputed: 'desc'
      }
    });
    
    if(fpl1.length != 0){
      await prisma.aftn.update({
        where: {
          id: fpl[i].id
        },
        data: {
          sfpiId: fpl1[0].sfpiId,
          isJatsc: fpl1[0].isJatsc,
        }
      });
      console.log(`${fpl[i].callsign} FPL--> ${no} of ${fpl.length}`)
      no++
    }  
  
  }
}



// lastFpl();
// runDep();
// runArr();
// runDla();
// runCnl();
runChg()