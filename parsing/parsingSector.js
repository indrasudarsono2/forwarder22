const fs = require('fs');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

// const readData = async() => {
const readData = async(dataSfpl, fileSfpl) => {
  try {
      //////IF WANT TO PARSE BASED ON DAY///////////////
      // for (let h = 1 ; h <= 2 ; h++){
      // const dataSfpl = fs.readFileSync('./sfpl_202403_22.log', 'utf8')
      // const day = h < 10 ? `0${h}` : `${h}`;
      // const dataSfpl = fs.readFileSync(`/opt/lampp/htdocs/new/sfpl/sfpl_202404_${day}.log`, 'utf8')
      //////////////////////////////////////////////////////////////

      const regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w*|\d*):((?: New)? SFPL Sector Assignment (?:inserted|updated)):\s*SFPI\s*= (\d*)\s*CURRENT SECTOR\s*= (\w*|\w* --> \w*)?\s*NEW SECTOR\s*= ( --> \w*|\w* -->|)\s*CWP IDENTIFIER\s*=\s*(--> \d*|\d* -->)?\s*HANDOVER STATE\s*=\s*(\w* --> \w*|\w*)\s*PASSED SECTORS\s*=\s*(\d* --> \d*|\d*)/gm
      const regexIsEntry = /^ --> \w*$/;
      const match = dataSfpl.match(regex);
      // const getData = regex.exec(match[6]);
      // console.log(match.length);
      if (match !== null) {
        for(let i = 0 ; i < match.length ; i++){
          const now = dayjs.utc().toISOString();
          const percentage = i;
          const progress=  async(now, fileSfpl, percentage) => {
            const progressMessage = `${now} : sectorLog ${fileSfpl} ${percentage} of ${match.length} completed`;
            console.log(progressMessage);
          }
          regex.lastIndex = 0;
          const getData = regex.exec(match[i]);
          const isEntry = regexIsEntry.test(getData[5]);
          const entrySector = getData[3].includes('New SFPL Sector Assignment inserted') || getData[8] === 'SELECT --> IDLE' || isEntry === true ? true : false;
          
          if (getData !== null){
            const database = await prisma.sectorLogs.findFirst({
              where: {
                sfpiId: getData[4],
                time: dayjs.utc(getData[1]).format(),
                // onCwp: getData[2],
                initialState: getData[3],
                currentSector: getData[5],
                newSector: getData[6],
                cwpIndentifier: getData[7],
                handoverState: getData[8],
                passedSector: getData[9],
                isEntry: entrySector
              }
            });
       
            if(!database){
              const sfpl = await prisma.sfpis.findFirst({
                where: {
                  id: getData[4]
                }
              })

              if(sfpl){
                await prisma.sectorLogs.create({
                  data: {
                    sfpiId: getData[4],
                    time: dayjs.utc(getData[1]).format(),
                    onCwp: getData[2],
                    initialState: getData[3],
                    currentSector: getData[5],
                    newSector: getData[6],
                    cwpIndentifier: getData[7],
                    handoverState: getData[8],
                    passedSector: getData[9],
                    isEntry: entrySector
                  }
                })
              }
              await progress(now, fileSfpl, percentage);
            }else{
              
              // console.log('continue');
              continue;
            }
          }else{
            console.log('error')
          }
        }
      }


    // }
  
    /**
     * 
     * match() to getting string matched in a File
     * exec() to generate group of string matched
     * 
     */
    
    
  } catch (error) {
    console.log(error) 
  }
}
module.exports = { readData };

// readData();


// const readDatabase = async () => {
//   const data = await prisma.sectorLogs.findMany({
//     where: {
//       isEntry: false
//     }
//   })
//   console.log(data.length);
// }

// readDatabase()