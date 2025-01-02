// var mysql = require('mysql');

// var db = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "sfpl"
// });

// db.connect(function(err) {
//     if (err) throw err;
    
// });

// module.exports = db;
// const percentage = i+1/match.length*100;

// const i = 20/105*100;
// console.log(i.toFixed(2))

// const fs = require('fs/promises');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const deleteData = async () => {
  // const sfpiId = [];
  // const log = await prisma.logs.findMany({
  //   where: {
  //     time: {
  //       gte: dayjs.utc("2024-07-25 00:00:00").toDate(),
  //       lte: dayjs.utc("2024-07-25 23:59:59").toDate(),
  //     }
  //   },
  //   select: {
  //     sfpiId: true
  //   }
  // })
  
  // for(let i = 0 ; i < log.length; i++){
  //   if(!sfpiId.includes(log[i].sfpiId)){
  //     sfpiId.push(log[i].sfpiId);
  //   }
  // };
  // console.log(sfpiId.length);
  // const deleteJune = await prisma.sfpis.deleteMany({
  //   where: {
  //     id : {
  //       in: sfpiId
  //     }
  //   }
  // });

  // console.log(deleteJune);
  // const sfpi = await prisma.sfpis.findFirst({
  //     where: {
  //       id: String(18210718),
  //       estTimeOfEntry: {
  //         not: null
  //       }
       
  //     },
  //     include: {
  //       logPath: {
  //         where: {
  //           estTimeOfEntry : {
  //             not: null
  //           },
  //           paths: {
  //             not: null
  //           }
  //         },
  //         orderBy: 
  //           [
  //             {numWaypoints: 'desc'},
  //             {id: 'desc'}
  //           ]
  //         ,
  //         take: 1
  //       }
  //     }
  //   })

  // if(sfpi && sfpi.logPath.length != 0){
  //   const path = JSON.parse(sfpi.logPath[0].paths)
  //   console.log(path);
  // }else{
  //   console.log('no')
  // }

  const data = null;
  const json = JSON.parse(data);

  if(json.state == "WAITING"){
    console.log('oke')
  }else{
    console.log('not oke')
  }
}
deleteData()
