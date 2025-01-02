const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const sector = require('../sector.json');
const {hadesFunct} = require('../hades/hadesFunc')
dayjs.extend(utc);

module.exports = {
  dashboard: async(req, res) => {
    try {
      const sfpiId = [];
      const pathIn = [];
      const now = dayjs.utc().toDate();
      const today = dayjs.utc(req.body['date']).startOf('day').toDate();
      const tomorow = dayjs.utc(today).add(1,'day').toDate();
      const log = await prisma.logs.findMany({
        where: {
          time: {
            gte: today,
            lt: tomorow
          }
        },
        select: {
          sfpiId: true,
        }
      });
      
      for(let i in log){
        if(!sfpiId.includes(log[i].sfpiId)){
          sfpiId.push(log[i].sfpiId);
        }
      }
      
      const sfpi = await prisma.sfpis.findMany({
        where: {
          id: {
            in: sfpiId
          },
          state: "ACTIVE"
        }
      });
      
      const allsfpi = await prisma.sfpis.findMany({
        where: {
          id: {
            in: sfpiId
          },
        }
      })
      
      for(let j = 0 ; j < sfpi.length ; j++){
        const logPath = await prisma.logPaths.findFirst({
          where: {
            sfpiId: sfpi[j].id,
            NOT: {
              estTimeOfEntry: null,
              paths: null
            }
          },
          orderBy: {
            estTimeOfEntry: 'desc'
          },
          select: {
            sfpiId: true,
            time: true,
            mod: true,
            arrivalTime: true,
            paths: true,
            sfpi: {
              select: {
                callsign: true,
                aircraftReg: true,
                aircraftType: true,
                adep: true,
                ades: true
              }
            }
          },
        })
        if(!logPath || !logPath.paths || logPath.paths == null || logPath.paths == []){
          continue;
        }else{
          const json = JSON.parse(logPath.paths);
          // const filter = json.filter(point => dayjs.utc(point.time) > now);
          if(dayjs.utc(json[json.length-1].time).toDate() > now && sfpi[j].scheduledTime < now){
            pathIn.push(logPath);
          }
        }
      }
    
      const result = {
        "sfpl" : sfpi,
        "logPath" : pathIn,
        "allSfpl" : allsfpi
      }

      res.json(result)
    } catch (error) {
      console.log(error);
    }
  },

  sector: async(req, res) => {
    try {
      const acc = sector[0]["ACC"];
      const app = sector[1]["APP"];
      const sectorSelected = [...acc, ...app, sector[2], sector[3]]
      const sectors = []

      sectorSelected.forEach(main => {
        Object.keys(main).forEach(sector => {
          sectors.push(sector);
        })
      })
      
      res.json(sectors);
    } catch (error) {
      console.log(error)
    }
  },

  allSfpl: async(req, res) => {
    try {
      const from = dayjs.utc(req.body.from).startOf('day').toDate();
      const to = dayjs.utc(req.body.to).startOf('day').add(1,'day').toDate();
      const sfpiId = [];

      const log = await prisma.logs.findMany({
        where: {
          time: {
            gte: from,
            lt: to
          }
        }
      })
      
      for(let i in log){
        if(!sfpiId.includes(log[i].sfpiId)){
          sfpiId.push(log[i].sfpiId);
        }
      }
      
      const sfpi = await prisma.sfpis.findMany({
        where: {
          id: {
            in: sfpiId,
          }
        }
      })
      
      const result = {
        "sfpi" : sfpi
      }
      
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  },

  dataPerSerctor: async(req, res) => {
    try {
      const from = req.body.from;
      const to = req.body.to;
      const rawData = [];
      if(req.body.sector == "ABC"){
        const sfpiId = []
        const sectorSelected = ["UNTA", "UTPG"]
        var reportInit = await prisma.report.findMany({
          where: {
            sector: {
              in: sectorSelected
            },
            time: {
              gte: dayjs.utc(from).startOf('day').toDate(),
              lt: dayjs.utc(to).add(1, 'day').startOf('day').toDate()
            }
          },
          select: {
            sfpiId: true
          }
        })
        
        for(let i in reportInit){
          if(!sfpiId.includes(reportInit[i].sfpiId)){
            sfpiId.push(reportInit[i].sfpiId)
          }
        }

        var report = await prisma.report.findMany({
          where: {
            sfpiId: {
              in: sfpiId
            },
            time: {
              gte: dayjs.utc(from).startOf('day').toDate(),
              lt: dayjs.utc(to).add(1, 'day').startOf('day').toDate()
            }
          },
          select: {
            sfpiId: true,
            sector: true,
            time: true,
            sfpi: {
              select: {
                callsign: true,
                adep: true,
                ades: true
              }
            }
          }       
        })

        for(let x in report){
          const data = {
            "sfpiId": report[x].sfpiId,
            "sector": report[x].sector,
            "time": report[x].time,
            "callSign": report[x].sfpi.callsign,
            "adep": report[x].sfpi.adep,
            "ades": report[x].sfpi.ades
          }

          rawData.push(data);
        }
        
      }else{
        const sectorSelected = [req.body.sector]
        var report = await prisma.report.findMany({
          where: {
            sector: {
              in: sectorSelected
            },
            time: {
              gte: dayjs.utc(from).startOf('day').toDate(),
              lt: dayjs.utc(to).add(1, 'day').startOf('day').toDate()
            }
          },
          select: {
            sfpiId: true,
            sector: true,
            time: true,
            sfpi: {
              select: {
                callsign: true,
                adep: true,
                ades: true
              }
            }
          }
        })

        for(let x in report){
          const dataRaw = {
            "sfpiId": report[x].sfpiId,
            "sector": report[x].sector,
            "time": dayjs.utc(report[x].time).format("DD-MM-YYYY HH:mm:ss"),
            "callSign": report[x].sfpi.callsign,
            "adep": report[x].sfpi.adep,
            "ades": report[x].sfpi.ades
          }

          rawData.push(dataRaw);
        }
      }

      const groupedData = new Map();

      report.forEach(entry => {
        const sectorOwner = entry.sector;
        const time = dayjs.utc(entry.time).toDate();
        const hour = dayjs.utc(time).format("HH");

        if(!groupedData.has(sectorOwner)){
          groupedData.set(sectorOwner, []);
        }

        groupedData.get(sectorOwner).push({...entry, hour})
      })

      const result = Array.from(groupedData, ([sectorOwner, entries]) => ({sectorOwner, entries}));

      const data = result[0].entries;
      
      const nextGroupedData = {};

      data.forEach(entry => {
        if(entry.time){
          const date = dayjs.utc(entry.time).format("YYYY-MM-DD");
          const hour = entry.hour;
          const timeSlot = `${hour}00-${hour}59`;
          
          
          if(!nextGroupedData[date]){
            nextGroupedData[date] = {
              "0000-0059" : 0,
              "0100-0159" : 0,
              "0200-0259" : 0,
              "0300-0359" : 0,
              "0400-0459" : 0,
              "0500-0559" : 0,
              "0600-0659" : 0,
              "0700-0759" : 0,
              "0800-0859" : 0,
              "0900-0959" : 0,
              "1000-1059" : 0,
              "1100-1159" : 0,
              "1200-1259" : 0,
              "1300-1359" : 0,
              "1400-1459" : 0,
              "1500-1559" : 0,
              "1600-1659" : 0,
              "1700-1759" : 0,
              "1800-1859" : 0,
              "1900-1959" : 0,
              "2000-2059" : 0,
              "2100-2159" : 0,
              "2200-2259" : 0,
              "2300-2359" : 0,
              "Total" : 0,
            }
          }

          nextGroupedData[date][timeSlot]++;
          nextGroupedData[date]["Total"]++;
        }
      })

      const finalJson = Object.keys(nextGroupedData).map(date => {
        return {
          date: date,
          ...nextGroupedData[date]
        }
      });

      const send = {
        "dataPerSector" : finalJson,
        "rawData": rawData
      };
      
      res.json(send);
    } catch (error) {
      console.log(error)
    }
  },

  dataPerPoint: async(req, res) => {
    try {
      const from = req.body.from;
      const to = req.body.to;
      const pointSelectedOri = req.body.point
      const pointSelected = pointSelectedOri.split(" ")
      const sfpiId = []
      const nextGroupedData = {};
      const rawData = [];

      const log = await prisma.logs.findMany({
        where: {
          time: {
            gte: dayjs.utc(from).startOf('day').toDate(),
            lt: dayjs.utc(to).add(1, 'day').startOf('day').toDate()
          },
          data: {
            contains: pointSelected[0]
          }
        }
      })

      for(let i in log){
        if(!sfpiId.includes(log[i].sfpiId)){
          sfpiId.push(log[i].sfpiId);
        }
      }
      
      for(let j = 0 ; j < sfpiId.length ; j++){
        const logPath = await prisma.logPaths.findFirst({
          where: {
            sfpiId: sfpiId[j],
            estTimeOfEntry: {
              not: null
            },
            paths: {
              not: null
            }
          },
          select: {
            sfpiId: true,
            numWaypoints: true,
            paths: true,
            time: true,
            sfpi: {
              select: {
                callsign: true,
                aircraftReg: true,
                aircraftType: true,
                adep: true,
                ades: true,
                requestedFlightLevel: true
              }
            }
          },
          orderBy: {
            numWaypoints: 'desc'
          },
        });
                
        if(!logPath){
          continue;
        }else{
          const path = JSON.parse(logPath.paths);
          let point = []
          for (let k in pointSelected){
            const targetPoint = path.filter(data => data.pointName == pointSelected[k])
            
            if(!targetPoint.length){
              point = []
              continue;
            }else{
              if(k == 0){
                point.push(targetPoint[0])
              }else{
                continue;
              }
            }
          }
          
          if(point.length != 0){
            const time = dayjs.utc(point[0].time).toDate();
            const from1 = dayjs.utc(from).startOf('day').toDate();
            const to1 = dayjs.utc(to).add(1, 'day').startOf('day').toDate();
            
            if(time > from1 && time < to1){
              logPath["point"] = point[0].pointName;
              logPath["estimate"] = point[0].time
              logPath["hour"] = dayjs.utc(point[0].time).format("HH");
  
              const date = dayjs.utc(point[0].time).format("YYYY-MM-DD");
              const hour = logPath.hour;
              const timeSlot = `${hour}00-${hour}59`;
              if(!nextGroupedData[date]){
                nextGroupedData[date] = {
                  "0000-0059" : 0,
                  "0100-0159" : 0,
                  "0200-0259" : 0,
                  "0300-0359" : 0,
                  "0400-0459" : 0,
                  "0500-0559" : 0,
                  "0600-0659" : 0,
                  "0700-0759" : 0,
                  "0800-0859" : 0,
                  "0900-0959" : 0,
                  "1000-1059" : 0,
                  "1100-1159" : 0,
                  "1200-1259" : 0,
                  "1300-1359" : 0,
                  "1400-1459" : 0,
                  "1500-1559" : 0,
                  "1600-1659" : 0,
                  "1700-1759" : 0,
                  "1800-1859" : 0,
                  "1900-1959" : 0,
                  "2000-2059" : 0,
                  "2100-2159" : 0,
                  "2200-2259" : 0,
                  "2300-2359" : 0,
                  "Total" : 0,
                }
              }
  
              nextGroupedData[date][timeSlot]++;
              nextGroupedData[date]["Total"]++;

              const dataRaw = {
                "sfpiId": logPath.sfpiId,
                "time": dayjs.utc(logPath.time).format("DD-MM-YYYY HH:mm:ss"),
                "callSign": logPath.sfpi.callsign,
                "adep": logPath.sfpi.adep,
                "ades": logPath.sfpi.ades
              }
    
              rawData.push(dataRaw);
            }
          }
        }
      }
      
      const finalJson = Object.keys(nextGroupedData).map(date => {
        return {
          point: pointSelectedOri,
          date: date,
          ...nextGroupedData[date]
        }
      });

      const result = {
        "dataPerPoint" : finalJson,
        "rawData": rawData
      }

      result.dataPerPoint.sort((a, b) => {
        const aTime = dayjs.utc(a.date).toDate();
        const bTime = dayjs.utc(b.date).toDate();

        return aTime-bTime;
      })

      res.json(result);
    } catch (error) {
      console.log(error)
    }
  },

  tsdData: async(req, res) => {
    try {
      const from = dayjs.utc(req.body.from).startOf('day').toDate();
      const to = dayjs.utc(req.body.to).startOf('day').add(1, 'day').toDate();
      
      const tsd = await hadesFunct(from, to) 
      const result = {
        "tsd" : tsd
      }
      res.json(result);
  
    } catch (error) {
      console.log(error)
    }
  }
}