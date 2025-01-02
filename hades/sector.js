const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const sector = require('../sector.json');
dayjs.extend(utc);

const unta = sector[0].ACC[12].UNTA
const utpg = sector[0].ACC[13].UTPG
const abc = [...unta, ...utpg]
console.log(abc);