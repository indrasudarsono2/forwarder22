const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const run = async() => {
  const regexFilterFpl = /\((?<typMsg>\w{3})-(?<callsign>\w+)[\s\S]*?\n[\s\S]*?\n-(?<adep>\w{4})(?<eobt>\d{4})\s*-\w* (?<route>[\s\S]*?)(?=-)-(?<ades>\w{4})(?<eat>\d{4})( (?<altn>[\w ]*))?\s*-[\w\S\s]*DOF\/(?<dof>\d{6})\s*(REG\/(?<areg>\w*)[\w\S\s]*\))?/gm
  const fpl = await prisma.aftn.findMany({
    where: {
      msgType: "FPL"
    }
  });
  let no = 1;
  for(let i in fpl){
    regexFilterFpl.lastIndex = 0;
    const fplMessage = fpl[i].message;
    const exec = regexFilterFpl.exec(fplMessage);
    if(exec){
      const { eobt } = exec.groups;
      await prisma.aftn.update({
        where: {
          id: fpl[i].id
        },
        data: {
          eobt: eobt
        }
      })
      console.log(`DATA KE ${no} FROM ${fpl.length}`);
      no++
    }
  }
}

run()