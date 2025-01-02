const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

module.exports = {
  sendData: async (req, res) => {
    const date = req.body.date;
    const now = dayjs.utc(date).startOf('day').toDate();
    const tomorow = dayjs.utc(now).add(1,'day').toDate();
    const sfplId = []
    const sfpl = await prisma.sfpis.findMany({
      where: {
        dateInit: {
          gte: now,
          lt: tomorow
        }
      }
    })

    for(let i = 0 ; i < sfpl.length ; i++){
      sfplId.push(sfpl[i].id)
    }

   
    const log = await prisma.logs.findMany({
      where: {
        sfpiId : {
          in: sfplId
        }
      },
      select: {
        sfpiId: true,
        time: true,
        mod: true,
        updType: true,
        data: true
      }
    });

    const logPath = await prisma.logPaths.findMany({
      where: {
        sfpiId: {
          in: sfplId
        }
      },
      select: {
        sfpiId: true,
        time: true,
        mod: true,
        updType: true,
        arrivalTime: true,
        estTimeOfEntry: true,
        coordinatedExitTime: true,
        previousFir: true,
        nextFir: true,
        numWaypoints: true,
        paths: true
      }
    });

    const path = await prisma.paths.findMany({
      where: {
        sfpiId: {
          in: sfplId
        }
      },
      select: {
        sfpiId: true,
        logTime: true,
        pointName: true,
        time: true,
        status: true
      }
    });

    const report = await prisma.report.findMany({
      where: {
        sfpiId: {
          in: sfplId
        },
      },
      select: {
        sfpiId: true,
        sector: true,
        time: true
      }
    });

    const sectorLog = await prisma.sectorLogs.findMany({
      where: {
        sfpiId: {
          in: sfplId
        }
      },
      select: {
        sfpiId: true,
        time: true,
        onCwp: true,
        initialState: true,
        currentSector: true,
        newSector: true,
        cwpIndentifier: true,
        handoverState: true,
        passedSector: true,
        isEntry: true
      }
    })

    const aftn = await prisma.aftn.findMany({
      where: {
        sfpiId: {
          in: sfplId
        }
      },
      select: {
        sfpiId: true,
        timeInputed: true,
        callsign: true,
        areg: true,
        adep: true,
        ades: true,
        dof: true,
        msgType: true,
        origin: true,
        message: true,
        isVerified: true,
        isJatsc: true
      }
    })
  
    const result = {
      allSfpl : sfpl,
      allLog : log,
      allLogPath : logPath,
      allPath : path,
      allReport: report,
      allSectorLog : sectorLog,
      allAftn: aftn,
    }

    res.json(result)
  }
}