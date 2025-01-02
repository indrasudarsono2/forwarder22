const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const fs = require('fs');
const axios = require('axios');
const { aftn } = require('../aftn/aftn');
// const { test } = require('../aftn/testError');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

module.exports = {
  gettingData: async (req, res) => {
    try {
      var data = "";

      req.on('data', items => {
        data += items
      })

      req.on('end', async () => {
        await aftn(data)
        // await test();
        res.sendStatus(200);
      })
    } catch (error) {
      console.log(error)
    }
  }
}