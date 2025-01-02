const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const {processFile} = require('../parsing/parseSfpl3');
const fs = require('fs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

module.exports = {
  bufferingSfpl: async (req, res) => {
    try {
      var data = ""

      req.on('data', items => {
        data += items;
        
      });
      
      req.on('end', async() => {
        // console.log('Received data:', data);
        // console.log(data);
        await processFile(data)
        //fs.writeFileSync('data.txt', data);
          
        res.sendStatus(200);
      });
    } catch (error) {
      console.log(error)
    }
  }
}
