const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  pardi: async(req, res) => {
    let now = new Date('2023-07-12T11:00:00Z');
    now.setMinutes(now.getMinutes()-2)
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-2)
    // console.log(now);
    // console.log(before);
    try {
      var sfpiId = []
      const pardi = await prisma.paths.findMany({
        where: {
          pointName: 'PARDI',
          time: {
            // lte: before.toISOString(),
            gte: now.toISOString()
            // lte: '2023-08-01T02:44:00Z',
            // gte: '2023-08-01T01:00:00Z'
          }
        },
      })

      
      for(let i = 0 ; i < pardi.length ; i++){
        sfpiId.push(pardi[i].sfpiId)
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
        
      // const jsonStringSfpi = JSON.stringify(sfpi,0,2)
      // fs.writeFileSync('pardi.json', jsonStringSfpi, 'utf-8')
      
      sfpi.sort((a, b) => {
        const aPardiTime = new Date(
          a.path.find((point) => point.pointName === "PARDI").time
        ).getTime();
        const bPardiTime = new Date(
          b.path.find((point) => point.pointName === "PARDI").time
        ).getTime();
        return aPardiTime - bPardiTime;
      });
      // console.log(sfpi);
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  ovset: async(req, res) => {
    let now = new Date('2023-07-12T11:00:00Z');
    now.setMinutes(now.getMinutes()+5)
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-90)
  
    try {
      var sfpiId = []
      const ovset = await prisma.paths.findMany({
        where: {
          pointName: {
            in: ['SOVMI', 'OVSET', 'JATAM']
          },
          time: {
            // lte: before.toISOString(),
            gte: now.toISOString()
            // lte: '2023-08-01T02:44:00Z',
            // gte: '2023-08-01T01:00:00Z'
          }
        },
      })

      for(let i = 0 ; i < ovset.length ; i++){
        sfpiId.push(ovset[i].sfpiId)
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
        
      sfpi.sort((a, b) => {
        const aOvsetTime = a.path.find((point) => ['SOVMI', 'OVSET', 'JATAM'].includes(point.pointName))?.time;
        const bOvsetTime = b.path.find((point) => ['SOVMI', 'OVSET', 'JATAM'].includes(point.pointName))?.time;

        if (aOvsetTime && bOvsetTime) {
          return new Date(aOvsetTime).getTime() - new Date(bOvsetTime).getTime();
        } else if (aOvsetTime) {
          return -1;
        } else if (bOvsetTime) {
          return 1;
        }
          return 0;
        });
      
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  lebeg: async(req, res) => {
    let now = new Date('2023-07-12T11:00:00Z');
    now.setMinutes(now.getMinutes()-30)
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-90)
  
    try {
      var sfpiId = []
      const lebeg = await prisma.paths.findMany({
        where: {
          pointName: {
            in: ['GUDBA', 'RIMTI']
          },
          time: {
            // lte: before.toISOString(),
            gte: now.toISOString()
            // lte: '2023-08-01T02:44:00Z',
            // gte: '2023-08-01T01:00:00Z'
          }
        },
      })

      for(let i = 0 ; i < lebeg.length ; i++){
        sfpiId.push(lebeg[i].sfpiId)
      }

      const sfpi = await prisma.sfpis.findMany({
        where: {
          id: {
            in: sfpiId
          },
          ades: {
            not: 'WILL'
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
        
      sfpi.sort((a, b) => {
        if(a.path.find((point) => point.pointName === "GUDBA") == null){
          var aLebegTime = new Date(
            a.path.find((point) => point.pointName === "RIMTI").time
          ).getTime();
        }else{
          var aLebegTime = new Date(
            a.path.find((point) => point.pointName === "GUDBA").time
          ).getTime();
        }
        
        if(b.path.find((point) => point.pointName === "GUDBA") == null){
          var bLebegTime = new Date(
            b.path.find((point) => point.pointName === "RIMTI").time
          ).getTime();
        }else{
          var bLebegTime = new Date(
            b.path.find((point) => point.pointName === "GUDBA").time
          ).getTime();
        }
        return aLebegTime - bLebegTime;
      });
      
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  bunik: async(req, res) => {
    let now = new Date('2023-07-12T12:00:00Z');
    now.setMinutes(now.getMinutes())
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-90)
  
    try {
      var sfpiId = []
      const bunik = await prisma.paths.findMany({
        where: {
          pointName: {
            in : ['BIKAL', 'BUNIK', 'IKIBU']
          },
          time: {
            // lte: before.toISOString(),
            gte: now.toISOString()
            // lte: '2023-08-01T02:44:00Z',
            // gte: '2023-08-01T01:00:00Z'
          }
        },
      })

      for(let i = 0 ; i < bunik.length ; i++){
        sfpiId.push(bunik[i].sfpiId)
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
      //   const aPardiTime = new Date(
      //     a.path.find((point) => point.pointName === "BUNIK").time
      //   ).getTime();
      //   const bPardiTime = new Date(
      //     b.path.find((point) => point.pointName === "BUNIK").time
      //   ).getTime();
      //   return aPardiTime - bPardiTime;
      // });

      sfpi.sort((a, b) => {
        const aBunikTime = a.path.find((point) => ['BIKAL', 'BUNIK', 'IKIBU'].includes(point.pointName))?.time;
        const bBunikTime = b.path.find((point) => ['BIKAL', 'BUNIK', 'IKIBU'].includes(point.pointName))?.time;

        if (aBunikTime && bBunikTime) {
          return new Date(aBunikTime).getTime() - new Date(bBunikTime).getTime();
        } else if (aBunikTime) {
          return -1;
        } else if (bBunikTime) {
          return 1;
        }
          return 0;
        });
      
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  plbJmb: async(req, res) => {
    let now = new Date('2023-07-12T12:00:00Z');
    now.setMinutes(now.getMinutes())
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-90)
  
    try {
      var sfpiId = []
      const bunik = await prisma.paths.findMany({
        where: {
          pointName: {
            in: ['GUSKO', 'TORUR', 'JMB']
          },
          time: {
            // lte: before.toISOString(),
            gte: now.toISOString()
            // lte: '2023-08-01T02:44:00Z',
            // gte: '2023-08-01T01:00:00Z'
          }
        },
      })

      for(let i = 0 ; i < bunik.length ; i++){
        sfpiId.push(bunik[i].sfpiId)
      }

      const sfpi = await prisma.sfpis.findMany({
        where: {
          id: {
            in: sfpiId
          },
          ades:{
            in: ['WIJJ', 'WIPP']
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
        
      sfpi.sort((a, b) => {
        if(a.path.find((point) => point.pointName === "GUSKO") == null){
          var aGuskoTime = new Date(
            a.path.find((point) => point.pointName === "ENSAV").time
          ).getTime();
        }else{
          var aGuskoTime = new Date(
            a.path.find((point) => point.pointName === "GUSKO").time
          ).getTime();
        }
        
        if(b.path.find((point) => point.pointName === "GUSKO") == null){
          var bGuskoTime = new Date(
            b.path.find((point) => point.pointName === "ENSAV").time
          ).getTime();
        }else{
          var bGuskoTime = new Date(
            b.path.find((point) => point.pointName === "GUSKO").time
          ).getTime();
        }
        return aGuskoTime - bGuskoTime;
      });
      
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  mimixRupka: async(req, res) => {
    let now = new Date('2023-07-12T12:00:00Z');
    now.setMinutes(now.getMinutes()+15)
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-90)
  
    try {
      var sfpiId = []
      const bunik = await prisma.paths.findMany({
        where: {
          pointName: {
            in: 'MIMIX'
          },
          time: {
            // lte: before.toISOString(),
            gte: now.toISOString()
            // lte: '2023-08-01T02:44:00Z',
            // gte: '2023-08-01T01:00:00Z'
          }
        },
      })

      for(let i = 0 ; i < bunik.length ; i++){
        sfpiId.push(bunik[i].sfpiId)
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
      //   const aPardiTime = new Date(a.path[a.path.length - 1].time).getTime();
      //   const bPardiTime = new Date(b.path[b.path.length - 1].time).getTime();
      //   return aPardiTime - bPardiTime;
      // });

      sfpi.sort((a, b) => {
        const aPardiTime = new Date(
          a.path.find((point) => point.pointName === "MIMIX").time
        ).getTime();
        const bPardiTime = new Date(
          b.path.find((point) => point.pointName === "MIMIX").time
        ).getTime();
        return aPardiTime - bPardiTime;
      });
      
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }, 
}