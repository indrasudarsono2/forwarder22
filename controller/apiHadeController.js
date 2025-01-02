const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const path = require('path');
const axios = require('axios');
const fs = require('fs')
const { Parser } = require('json2csv');

module.exports= {
  download: async(req, res) => {
    const now = dayjs.utc().toISOString();
    try {
      const fileName = `${req.params.file}.csv`;
      const filePath = path.join('/home/centos/PROGRAM/hades', fileName);

      res.download(filePath, fileName, err => {
        if(err){
          res.sendStatus(500)
          console.log(`${now} ${fileName} failed due to ${err}`)
        }else{  
          console.log(`${now} ${fileName} downloaded`)
        }
      })
    } catch (error) {
      res.sendStatus(500)
      console.log(`${now} ${fileName} failed due to ${err}`)
    }
  },

  aftn: async(req, res) => {
    try {
      const date = req.params.date;
      const getData = await axios.get(`http://172.21.4.23:3000/api/v1/download/${date}`);
      const allData = getData.data
      const regex = /(?<content>[A-Z]{2,} [\s\S]*)\n\n/gm
      const clearData = []

      for(let i = 0 ; i < allData.length ; i++){
        regex.lastIndex = 0;
        const process = regex.exec(allData[i].msg)
        
        if(process != null){
          const result = { message : process.groups.content }
          clearData.push(result)
        }else{
          const result = { message : allData[i].msg }
          clearData.push(result)
        }
      }
      
      // const string = JSON.stringify(allData, 1, 1);
      // fs.writeFileSync('./test.json', string);
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(clearData);
      // fs.writeFileSync('./test.csv', csv);
      res.attachment(`Aftn${date}.csv`);  // Sets the file name and triggers download in the browser
      res.type('text/csv');        // Sets the MIME type to CSV
      res.send(csv); 
    } catch (error) {
      console.log(error)
    }
  }
}