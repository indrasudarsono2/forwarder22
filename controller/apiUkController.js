const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')

module.exports = {
  uk: async(req, res) => {
    let now = new Date();
    // now.setMinutes(now.getMinutes()-2);
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-2);

    try {
      var sfpiId = [];
      const level = [310 , 320, 330, 340, 350, 360, 370, 380, 390, 400, 410];
      var newSfpi = {};
      const ukPoint = await prisma.paths.findMany({
        where: {
          pointName: {
            in: [
              'SURGA', 
              'KIKOR', 
              'KADAR',
              'BAVUS', 
              'ARUPA', 
              'PAPSA',
              'ANIPU', 
              'OKADA', 
              'OSRUT', 
              'ENPIN', 
              'SUGIK',
              'TANUR',
              'TAVIP', 
              'SPIKO', 
              'RUPKA',
              'DENDY',
              'OLDUN',
              'TEPEV',
              'OLVES',
              'PNK',
              'ANY',
              'MIMIX'
            ]
          },
          time: {
            // lte: before.toISOString(),
            gte: now.toISOString()
            // lte: '2023-08-01T02:44:00Z',
            // gte: '2023-08-01T01:00:00Z'
          },
        },
        include: {
          sfpi: {
            include: {
              path: true
            }
          }
        }
      })

      

      for(let i = 0 ; i < ukPoint.length ; i++){
        // const containSfpiId = sfpiId.find((id) => ukPoint[i].sfpiId.includes(id.sfpiId));
        const containSfpiId = sfpiId.find((id) => ukPoint[i].sfpiId.includes(id));
        const includeJavaRoute = ukPoint[i].sfpi.path.find(point => ['CA', 'PIALA'].includes(point.pointName))
        
        if(includeJavaRoute){
          continue;
        }

        if(containSfpiId == null){
          sfpiId.push(ukPoint[i].sfpiId)
        }else{
          continue;
        }
      }
      
      const sfpi = await prisma.sfpis.findMany({
        where: {
          id: {
            in: sfpiId
          },
          state: 'ACTIVE'
        },
        orderBy:{
          clearedFlightLevel: 'asc'
        },
        include: {
          path: {
            select: {
              pointName: true,
              time : true
            }
          }
        }
      })

      // sfpi.sort((a, b) => {
      //   const aBunikTime = a.path.find((point) => ['BIKAL', 'BUNIK', 'IKIBU'].includes(point.pointName))?.time;
      //   const bBunikTime = b.path.find((point) => ['BIKAL', 'BUNIK', 'IKIBU'].includes(point.pointName))?.time;

      //   if (aBunikTime && bBunikTime) {
      //     const timeDifference = Math.abs(new Date(aBunikTime) - new Date(bBunikTime));
          
      //     if (timeDifference < 2 * 60 * 1000 && a.clearedFlightLevel == b.clearedFlightLevel) { // 2 minutes in milliseconds
      //       a.traffic = [{"callsign" : b.callsign, "pointName" : "BUNIK"}];
      //       b.traffic = [{"callsign" : a.callsign, "pointName" : "BUNIK"}];
      //     }
      //     return new Date(aBunikTime).getTime() - new Date(bBunikTime).getTime();
      //   } else if (aBunikTime) {
      //     return -1;
      //   } else if (bBunikTime) {
      //     return 1;
      //   }
      //     return 0;
      //   });

      // for (let j = 0 ; j < sfpi.length ; j++){
      //   const sameExitFl = 
      // }

      /////-------------------------------------------------------------------------------------------------------------------
      // COMPARING ESTIMATE WITH SAME WAYPOINT
      // const selected = sfpi.filter(item => item.exitFlightLevel==400);
      // for(let j = 0 ; j < selected.length ; j++){
      //   console.log(`j: ${j}`)
      //   if(j === selected.length-1){
      //     break;
      //   }

      //   for(let k = 0 ; k < selected[j].path.length ; k ++){
      //     const pointName = selected[j].path[k].pointName

      //     console.log(selected[j].path[k]);
      //     console.log(`k: ${k}`)

      //     for(l = 1 ; l < selected.length ; l++){
      //       if(j+l === selected.length){
      //         continue;
      //       }

      //       const getPoint = selected[j+l].path.find((point) => pointName.includes(point.pointName));

      //       console.log(`l: ${l}`);
      //       if(getPoint==null){
      //         console.log('continue')
      //         continue
      //       }else{
      //         console.log('not null')
      //         const time1 = dayjs(selected[j].path[k].time)
      //         const time2 = dayjs(getPoint.time)
              
      //         const timeDifferenceInMinutes = time2.diff(time1, 'minute');
              
      //         if(timeDifferenceInMinutes >= -5 || timeDifferenceInMinutes <= 5){
      //           if(!selected[j].traffic){
      //             selected[j].traffic = [{"callsign" : selected[j+l].callsign, "pointName" : getPoint.pointName}]
      //           }else{
      //             selected[j].traffic.push({"callsign" : selected[j+l].callsign, "pointName" : getPoint.pointName})
      //           }

      //           if(!selected[j+l].traffic){
      //             selected[j+l].traffic = [{"callsign" : selected[j].callsign, "pointName" : getPoint.pointName}]
      //           }else{
      //             selected[j+l].traffic.push({"callsign" : selected[j].callsign, "pointName" : getPoint.pointName})
      //           }
                
      //           continue;
      //         }else{
      //           continue;
      //         }
      //       }
      //     }
      //   }
      // }
      //---------------------------------------------------------------------------------------------------------------------------------
    
      for(let i = 0 ; i < level.length ; i++){
        const selected = sfpi.filter(item => item.exitFlightLevel==level[i]);
        var levelString = level[i].toString();
        newSfpi[levelString] = selected;
      }

      newSfpi['others'] = sfpi.filter(item => !level.includes(item.exitFlightLevel));
      
      res.json(newSfpi);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
