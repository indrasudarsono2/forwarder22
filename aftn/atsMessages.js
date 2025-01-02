const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const cron = require('node-cron');

dayjs.extend(utc);


const runDep = async () => {
  try {
    const now = dayjs.utc().toDate();
    const before = dayjs.utc(now).subtract(10, 'minutes').toDate();
    const longBefore = dayjs.utc(now).subtract(10, 'days').toDate();
    const aftnDep = await prisma.aftn.findMany({
      where:{
        timeInputed: {
          gte: before,
          // gte: longBefore,
          lt: now
        },
        isVerified: true,
        sfpiId: null,
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
              lt: now
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
        console.log(`${dayjs.utc(now).toISOString()} ${aftnDep[i].callsign} DEP--> ${no} of ${aftnDep.length}`)
        no++;
      }
    }
      /**---------------------------------------------------------------------------------------- */
  } catch (error) {
    console.log(error)
  }   
}
  
const runArr = async() => {
  try {
    const now = dayjs.utc().toDate();
    const before = dayjs.utc(now).subtract(10, 'minutes').toDate();
    const longBefore = dayjs.utc(now).subtract(10, 'days').toDate();
    const aftnArr = await prisma.aftn.findMany({
      where:{
        timeInputed: {
          gte: before,
          // gte: longBefore,
          lt: now
        },
        // isVerified: false,
        isVerified: true,
        sfpiId: null,
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
        console.log(`${dayjs.utc(now).toISOString()} ${aftnArr[i].callsign} ARR--> ${no} of ${aftnArr.length}`)
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
        console.log(`${dayjs.utc(now).toISOString()} ${aftnArr[i].callsign} ARR--> ${no} of ${aftnArr.length}`)
        no++;
      }
    }
  } catch (error) {
    console.log(error)
  } 
}

const lastFpl = async()=> {
  const now = dayjs.utc().subtract(5, 'minutes').toDate();
  const before = dayjs.utc(now).subtract(35, 'minutes').toDate();
  // const longBefore = dayjs.utc(now).subtract(12, 'days').toDate();
  // const longBefore = dayjs.utc(now).subtract(20, 'hours').toDate();
  const fpl = await prisma.aftn.findMany({
    where:{
      timeInputed: {
        gte: before,
        // gte: longBefore,
        lt: now
      },
      // callsign: "THY057",
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
      console.log(`${dayjs.utc().toISOString()} ${fpl[i].callsign} FPL--> ${no} of ${fpl.length}`)
      no++
    }  
  }
}

const runDla = async() => {
  const now = dayjs.utc().subtract(5, 'minutes').toDate();
  const before = dayjs.utc(now).subtract(35, 'minutes').toDate();
  const longBefore = dayjs.utc(now).subtract(15, 'days').toDate();
  // const longBefore = dayjs.utc(now).subtract(12, 'hours').toDate();
  const aftnDla = await prisma.aftn.findMany({
    where:{
      timeInputed: {
        gte: before,
        // gte: longBefore,
        lt: now
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
      console.log(`${dayjs.utc().toISOString()} ${aftnDla[i].callsign} DLA--> ${no} of ${aftnDla.length}`)
      no++;
    }
  }
}

const runCnl = async() => {
  const now = dayjs.utc().subtract(5, 'minutes').toDate();
  const before = dayjs.utc(now).subtract(35, 'minutes').toDate();
  const longBefore = dayjs.utc(now).subtract(15, 'days').toDate();
  // const longBefore = dayjs.utc(now).subtract(12, 'hours').toDate();
  const aftnCnl = await prisma.aftn.findMany({
    where:{
      timeInputed: {
        gte: before,
        // gte: longBefore,
        lt: now
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
      console.log(`${dayjs.utc().toISOString()} ${aftnCnl[i].callsign} CNL--> ${no} of ${aftnCnl.length}`)
      no++;
    }
  }
}

const runChg = async () => {
  const now = dayjs.utc().subtract(5, 'minutes').toDate();
  const before = dayjs.utc(now).subtract(35, 'minutes').toDate();
  const longBefore = dayjs.utc(now).subtract(15, 'days').toDate();
  // const longBefore = dayjs.utc(now).subtract(12, 'hours').toDate();
  const aftnChg = await prisma.aftn.findMany({
    where:{
      timeInputed: {
        gte: before,
        // gte: longBefore,
        lt: now
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
            console.log(`${dayjs.utc().toISOString()} ${aftnChg[i].callsign} CHG--> ${no} of ${aftnChg.length}`)
            no++;
          }
        }
      }

    }
  }
}

let depIsRunning = false;
let arrIsRunning = false;
let lastFplRunning = false;
let dlaIsRunning = false;
let cnlIsRunning = false;
let chgIsRunning = false;

cron.schedule('5,15,25,35,45,55 * * * * ', async() => {
  if(depIsRunning) return;
  depIsRunning = true;
  try {
    await runDep();
  } catch (error) {
    console.log(`Cron Dep still running: ${error.message}`);
  }finally{
    depIsRunning = false ; 
  }
});

cron.schedule('0,10,20,30,40,50 * * * * ', async() => {
  if(arrIsRunning) return;
  arrIsRunning = true;
  try {
    await runArr();
  } catch (error) {
    console.log(`Cron Arr still running: ${error.message}`);
  }finally{
    arrIsRunning = false;
  }
});

cron.schedule('3,33 * * * *', async () => {
  if(lastFplRunning) return;
  lastFplRunning= true;
  try {
    await lastFpl();
  } catch (error) {
    console.log(`Cron lastFpl still running: ${error.message}`);
  }finally{
    lastFplRunning = false;
  }
})

cron.schedule('8,38 * * * *', async () => {
  if(dlaIsRunning) return;
  dlaIsRunning = true;
  try {
    await runDla()
  } catch (error) {
    console.log(`Cron Dla still running: ${error.message}`);
  }finally{
    dlaIsRunning = false;
  }
})

cron.schedule('13,43 * * * *', async() => {
  if(cnlIsRunning) return;
  cnlIsRunning = true;
  try {
    await runCnl();
  } catch (error) {
    console.log(`Cron Cnl still running: ${error.message}`);
  }finally{
    cnlIsRunning = false
  }
})

cron.schedule('18,48 * * * *', async() => {
  if(chgIsRunning) return;
  chgIsRunning = true;
  try {
    await runChg();
  } catch (error) {
    console.log(`Cron Chg strill running: ${error.message}`);
  }finally{
    chgIsRunning = false
  }
})