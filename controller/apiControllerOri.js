const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  pardi: async(req, res) => {
    let now = new Date();
    now.setMinutes(now.getMinutes()-2)
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-100)
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
    let now = new Date();
    now.setMinutes(now.getMinutes()+5)
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-90)
  
    try {
      var sfpiId = []
      const ovset = await prisma.paths.findMany({
        where: {
          pointName: 'OVSET',
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
        const aPardiTime = new Date(
          a.path.find((point) => point.pointName === "OVSET").time
        ).getTime();
        const bPardiTime = new Date(
          b.path.find((point) => point.pointName === "OVSET").time
        ).getTime();
        return aPardiTime - bPardiTime;
      });
      
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  lebeg: async(req, res) => {
    let now = new Date();
    now.setMinutes(now.getMinutes()+15)
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-90)
  
    try {
      var sfpiId = []
      const lebeg = await prisma.paths.findMany({
        where: {
          pointName: 'LEBEG',
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
        const aPardiTime = new Date(
          a.path.find((point) => point.pointName === "LEBEG").time
        ).getTime();
        const bPardiTime = new Date(
          b.path.find((point) => point.pointName === "LEBEG").time
        ).getTime();
        return aPardiTime - bPardiTime;
      });
      
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  bunik: async(req, res) => {
    let now = new Date();
    now.setMinutes(now.getMinutes())
    let before = new Date(now);
    before.setMinutes(before.getMinutes()-90)
  
    try {
      var sfpiId = []
      const bunik = await prisma.paths.findMany({
        where: {
          pointName: 'BUNIK',
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
        
      sfpi.sort((a, b) => {
        const aPardiTime = new Date(
          a.path.find((point) => point.pointName === "BUNIK").time
        ).getTime();
        const bPardiTime = new Date(
          b.path.find((point) => point.pointName === "BUNIK").time
        ).getTime();
        return aPardiTime - bPardiTime;
      });
      
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  plbJmb: async(req, res) => {
    let now = new Date();
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
        const aPardiTime = new Date(a.path[a.path.length - 1].time).getTime();
        const bPardiTime = new Date(b.path[b.path.length - 1].time).getTime();
        return aPardiTime - bPardiTime;
      });
      
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  mimixRupka: async(req, res) => {
    let now = new Date();
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
        
      sfpi.sort((a, b) => {
        const aPardiTime = new Date(a.path[a.path.length - 1].time).getTime();
        const bPardiTime = new Date(b.path[b.path.length - 1].time).getTime();
        return aPardiTime - bPardiTime;
      });
      
      res.json(sfpi);

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }, 
}