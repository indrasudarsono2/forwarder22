const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const fs = require('fs')
const axios = require('axios');
var dateCompleted = new Date();
var year = dateCompleted.getFullYear();
var month = dateCompleted.getMonth()+1 < 10 ? `0${dateCompleted.getMonth()+1}` : `${dateCompleted.getMonth()+1}`;
var day = dateCompleted.getDate() < 10 ? `0${dateCompleted.getDate()}` : `${dateCompleted.getDate()}`;
// var date = `${year}-${month}-${day}`

for(let tgl = 22 ; tgl < 27 ; tgl++){
  var date = `2024-03-${tgl}`;
  const now = new Date(date);
  const tomorow= new Date(now.getTime()+(24*60*60*1000))

  const queryData = async (date, callsign) => {
    try {
      const data = await prisma.sfpis.findMany({
        where: {
          estTimeOfEntry: {
            gte: new Date(date),
            lt: tomorow
          },
          callsign: {
            contains: callsign
          }
        },
        include: {
          log: {
            select: {
              data: true
            },
            where: {
              data: {
                contains: 'ACTIVE'
              }
            }
          }
        }
      })
      return data;
    } catch (error) {
      console.error("Error querying database:", error);
      throw error; // Rethrow the error for further handling
    }
  };

  // const updateData = async (id, fpl) => {
  //   try {
  //     const update = await prisma.sfpl_tbl.update({
  //       where:{
  //         Id: id
  //       },
  //       data: {
  //         flightPlan: fpl
  //       }
  //     });

  //     return update;
  //   } catch (error) {
  //     console.error("Error querying database:", error);
  //     throw error; // Rethrow the error for further handling
  //   }
  // }

  const getFplFromAPI = async (date) => {
    try {
      // Make a POST request to the API with the date
      const response = await axios.post('http://172.27.2.234:3002/aftnapi/flightPlan', {
        "tanggal": date
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching FPL from API:", error);
      throw error; // Rethrow the error for further handling
    }
  };

  const fetchData = async (date) => {
    try {
      const dataApi = await getFplFromAPI(date);
      const regex = /FPL-(\w*)/gm;
      const atsMessageM758 = await dataApi.filter(item => item.msg.includes('M758'));
      const fplM758 = await atsMessageM758.filter(item => item.msg.includes('FPL'));
      // fs.writeFileSync('fplM758',JSON.stringify(fplM758,0,1))
      const datas = []
      
      for(let fpl = 0 ; fpl < fplM758.length ; fpl++){
        regex.lastIndex=0;
        const dataMatch = regex.exec(fplM758[fpl]['msg']);
        const dataSfpi = await queryData(date, dataMatch[1]);
        const exeption = ['WM??','WI??','OM??']
        const regexExeption = new RegExp(exeption.join('|').replace(/\?/g, '.'))

        if(dataSfpi[0] != null || dataSfpi[0] != undefined){
          if(regexExeption.test(dataSfpi[0].adep)){
            continue;
          }else{
            const dataToBeInput = {
              "CALL SIGN" : dataSfpi[0].callsign,
              "ETN" : dataSfpi[0].estTimeOfEntry,
              "DEPARTURE" : dataSfpi[0].adep,
              "DESTINATION" : dataSfpi[0].ades,
              "FLIGHT LEVEL" : dataSfpi[0].clearedFlightLevel,
              "LOG ACTIVE" : dataSfpi[0].log[0].data,
              "FLIGHT PLAN": fplM758[fpl]['msg']
            }
            datas.push(dataToBeInput);
          }
        }
      }
      fs.writeFileSync(`${tgl}-m758.json`, JSON.stringify(datas,1,1));
      // for(var i = 0 ; i < dataReferred.length ; i++){
      //   const data = dataReferred[i];
      //   const fpl = await dataApi.filter(item => item.msg.includes(`FPL-${data.CALLSIGN}`));
        
      //   for(var j = 0; j < fpl.length ; j++){
      //     const singleData = fpl[j]['msg']
      //     const match = singleData.match(regex);
      //     const values = match.map(match => match.slice(1));    
      //     if(values[3] == data.ADEP && values[5] == data.ADES){
      //       console.log(`ambil data sfpl referred ke ${i} FPL yang ke ${j}`)
      //       updateData(data.Id, fpl[j]['msg']);
      //     }
      //   }   
      // }
    } catch (error) {
      console.error("Error fetching Data:", error);
      throw error; // Rethrow the error for further handling
    }
  }
  
  fetchData(date)
}
