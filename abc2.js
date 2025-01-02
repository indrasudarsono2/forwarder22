const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const sector = require('./sector.json')
const fs = require('fs')
const axios = require('axios');
var dateCompleted = new Date();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const abc = async() => {
	try {
		const unta = sector[0]["ACC"][12]["UNTA"];
		const utpg = sector[0]["ACC"][13]["UTPG"];
   
		// const acc = sector[3]["GP"];
		const abc = [...unta, ...utpg];
		// const abc = utpg;
		const sfpiId = []
		
		const abcPoint = await prisma.paths.findMany({
			where: {
				pointName: {
					in: abc
				},
				time: {
					// lte: before.toISOString(),
					// gte: now.toISOString()
					// gte: '2024-04-18T11:00:00Z',
					// lte: '2024-04-27T05:26:00Z',
          gte: '2024-03-22T00:00:00Z',
					lte: '2024-05-31T23:59:59Z',
				},
			},
			select: {
				sfpiId: true
			},
      // orderBy:{
      //   time: 'desc'
      // },
      // take: 1
		})

		for(let i = 0 ; i < abcPoint.length ; i++){
			// const containSfpiId = sfpiId.find((id) => ukPoint[i].sfpiId.includes(id.sfpiId));
			const containSfpiId = sfpiId.find((id) => abcPoint[i].sfpiId.includes(id));

			if(containSfpiId == null){
				sfpiId.push(abcPoint[i].sfpiId)
			}else{
				continue;
			}
		}

		const data = await prisma.sfpis.findMany({
			where: {
				id: {
					in: sfpiId
				},
				requestedFlightLevel: {
					gt : 245
				},
				estTimeOfEntry: {
					gte: '2024-03-01T00:00:00Z' 
				},
        log: {
          some: {
            data: {
              contains: 'ACTIVE'
            }
          }
        }
			},
			select: {
				id: true,
				callsign: true,
        aircraftReg: true,
        aircraftType: true,
				adep: true,
				ades: true,
				estTimeOfEntry: true,
        log: {
          where: {
            data: {
              contains: 'ACTIVE'
            }
          }
        }
			}
		})
   
    for(let j = 0 ; j < data.length ; j++){
      const log = await prisma.logs.findFirst({
        where: {
          sfpiId: data[j].id,
          mod: "FDPS_FPL",
          data: {
            contains: "pointName"
          },
          time: {
            gte: dayjs.utc(data[j].log[0]["time"]).toDate()
          }
        }
      });
      
      if(!log){
        data[j]["pointIn"] = null;
        data[j]["timeIn"] = null;
        data[j]["pointOut"] = null;
        data[j]["timeOut"] = null;
        // data[j]["sector"] = "UTPG";
        delete data[j].log;
        delete data[j].estTimeOfEntry;
      }else{
        const rawData = log["data"];
        const jsonLog= JSON.parse(rawData);
        const pointIn = jsonLog[0]["pointName"];
        const timeIn = dayjs.utc(jsonLog[0]["time"]).format("DD/MM/YYYY");
        const pointOut = jsonLog[jsonLog.length-1]["pointName"];
        const timeOut = dayjs.utc(jsonLog[jsonLog.length-1]["time"]).format("DD/MM/YYYY");

        if(pointIn && timeIn && pointOut && timeOut){
          data[j]["pointIn"] = pointIn;
          data[j]["timeIn"] = timeIn;
          data[j]["pointOut"] = pointOut;
          data[j]["timeOut"] = timeOut;
          // data[j]["sector"] = "UTPG";
          delete data[j].log;
          delete data[j].estTimeOfEntry;
        }else{
          console.log(`no ${j}`)
        }
      }
    }
    // console.log(data)
		fs.writeFileSync(`sfpl4.json`, JSON.stringify(data, 1, 1));
	} catch (error) {
		console.log('error')
	}
}

abc();