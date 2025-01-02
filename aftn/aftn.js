const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const fs = require('fs');
dayjs.extend(utc);
const now = dayjs.utc().toDate();
const before = dayjs.utc(now).subtract('12', 'hours').toDate();

const aftn = async (data) => {
  // const read = fs.readFileSync('./aftnTest.txt', 'utf-8');
  const regexAll = /(?<content>[A-Z]{2,}[\s\S]*)\n/gm
  const regexTypMsg = /^\d* (?<address>\w{8})[\s\S]*\((?<typMsg>\w{3})-/gm
  const regexFilterFpl = /\((?<typMsg>\w{3})-(?<callsign>\w+)[\s\S]*?\n[\s\S]*?\n-(?<adep>\w{4})(?<eobt>\d{4})\s*-\w* (?<route>[\s\S]*?)(?=-)-(?<ades>\w{4})(?<eat>\d{4})( (?<altn>[\w ]*))?\s*-[\w\S\s]*DOF\/(?<dof>\d{6})\s*(REG\/(?<areg>\w*)[\w\S\s]*\))?/gm
  const regexFilterDep = /\(\w*-(?<callsign>\w*)(\/\w*)?-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w{4})(?:\s*)?-(?:DOF\/)?(?<dof>\d+)\)/gm
  const regexFilterArr = /\(\w*-(?<callsign>\w*)(\/\w*)?-(?<adep>\w{4})(?<dep>\d{4})?-(?<ades>\w{4})(?<arr>\d{4})(?:\s*.*)?\)/gm
  const regexFilterDla = /\(\w*-(?<callsign>\w*)(\/\w*)?-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w{4})(?:\s*)?-(?:DOF\/)(?<dof>\d{6})\)/gm
  const regexFilterChg = /\(\w*-(?<callsign>\w*)-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w*)-(?<dof>[\w\S]*)-[\w\W]*\)/gm
  const regexFilterCnl = /\(\w*-(?<callsign>\w*)-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w*)-(?:DOF\/)?(?<dof>\d{6})\)/gm
  const regexRealDof = /(?<year>\d{2})(?<month>\d{2})(?<day>\d{2})/gm

  const typMsgFull = regexTypMsg.exec(data);
  const { typMsg, address } = typMsgFull.groups;
  const dataInputed = {
    sfpiId: null,
    timeInputed : dayjs.utc().toDate(),
    callsign: null,
    areg: null,
    adep: null,
    ades: null,
    dof: null,
    msgType: typMsg,
    origin: address,
    message: data,
    isVerified: false,
    isJatsc: false
  }

  if (typMsg == "FPL") {

    // const match = data.match(regexFilterFpl);
    // var exec = regexFilterFpl.exec(match[0]);
    // var exec = null;
    await fpl(regexFilterFpl, regexRealDof, data, dataInputed);
  }
  else if (typMsg == "DEP") {
    await dep(regexFilterDep, regexRealDof, data, dataInputed);
  } else if (typMsg == "ARR") {
    await arr(regexFilterArr, data, dataInputed);
  } else if (typMsg == "DLA") {
    await dla(regexFilterDla, regexRealDof, data, dataInputed);
  }else if(typMsg == "CNL"){
    await cnl(regexFilterCnl, regexRealDof, data, dataInputed);
  }else if(typMsg == "CHG"){
    await chg(regexFilterChg, regexRealDof, data, dataInputed);
  }
  // else if (typMsg == "CNL") {
  //   var exec = regexFilterCnl.exec(data);
  // }

  // if (exec) {
  //   const { callsign, adep, ades, dof } = exec.groups
  //   console.log(`${callsign}, ${adep}, ${ades}, ${dof}, ${typMsg}`)
  // } else {
  //   console.log(typMsg);
  //   fs.writeFile('./aftn/error.txt', data, err => {
  //     if (err) {
  //       console.log(err);
  //     }
  //   })
  // }
  // if (dof || dof != undefined) {
  //   const execDof = regexRealDof.exec(dof)
  //   var { year, month, day } = realDof.exec(execDof);
  //   var realDof = (`20${year}-${month},${day}`)
  // } else {
  //   var realDof = null;
  // }

  // await prisma.aftn.create({
  //   data: {
  //     sfpiId: null,
  //     callsign: callsign,
  //     adep: adep,
  //     ades: ades,
  //     dof: realDof,
  //     msgType: typMsg,
  //     address: address,
  //     message: data
  //   }
  // })
}

async function fpl(regexFilterFpl, regexRealDof, datas, dataInputed) {
  const exec = regexFilterFpl.exec(datas)
  if (exec) {
    const { callsign, areg, adep, ades, dof, eobt } = exec.groups
    const execRealDof = regexRealDof.exec(dof);

    if(execRealDof){
      const {year, month, day} = execRealDof.groups;
      const dateSelected = `20${year}-${month}-${day}`
      dataInputed["dof"] = dayjs.utc(dateSelected).toDate();
      // console.log(dateSelected);
    }

    dataInputed["callsign"] = callsign;
    dataInputed["areg"] = areg;
    dataInputed["adep"] = adep;
    dataInputed["ades"] = ades;
    dataInputed["eobt"] = eobt;
    dataInputed["isVerified"] = true;
    // dataInputed["dof"] = dof;
    await prisma.aftn.create({
      data: dataInputed
    })
    console.log(`${dayjs.utc().format('YYYY-MM-DD HH:mm:ss')} FPL ${callsign}, ${adep}, ${ades}, ${dof}`)
  }else{
      await prisma.aftn.create({
      data: dataInputed
    })
  }
}

async function dep(regexFilterDep, regexRealDof, datas, dataInputed){
  const exec = regexFilterDep.exec(datas)
  if (exec) {
    const { callsign, adep, ades, dof } = exec.groups
    const execRealDof = regexRealDof.exec(dof);

    if(execRealDof || dof != 0){
      const {year, month, day} = execRealDof.groups;
      const dateSelected = `20${year}-${month}-${day}`
      dataInputed["dof"] = dayjs.utc(dateSelected).toDate();
      // console.log(dateSelected);
    }

    dataInputed["callsign"] = callsign;
    dataInputed["adep"] = adep;
    dataInputed["ades"] = ades;
    dataInputed["isVerified"] = true;
    // dataInputed["dof"] = dof;
    await prisma.aftn.create({
      data: dataInputed
    })
    console.log(`${dayjs.utc().format('YYYY-MM-DD HH:mm:ss')} DEP ${callsign}, ${adep}, ${ades}, ${dof}`)
  }else{
    console.log(datas)
    await prisma.aftn.create({
      data: dataInputed
    })
  }
}

async function arr(regexFilterArr, datas, dataInputed){
  const exec = regexFilterArr.exec(datas)
  if (exec) {
    const { callsign, adep, ades } = exec.groups

    dataInputed["callsign"] = callsign;
    dataInputed["adep"] = adep;
    dataInputed["ades"] = ades;
    dataInputed["isVerified"] = true;
    
    await prisma.aftn.create({
      data: dataInputed
    })
    console.log(`${dayjs.utc().format('YYYY-MM-DD HH:mm:ss')} ARR ${callsign}, ${adep}, ${ades}`)
  }else{
    console.log(datas)
    await prisma.aftn.create({
      data: dataInputed
    })
  }
}

async function dla(regexFilterDla, regexRealDof, datas, dataInputed){
  const exec = regexFilterDla.exec(datas)
  if (exec) {
    const { callsign, adep, ades, dof } = exec.groups
    const execRealDof = regexRealDof.exec(dof);

    if(execRealDof || dof != 0){
      const {year, month, day} = execRealDof.groups;
      const dateSelected = `20${year}-${month}-${day}`
      dataInputed["dof"] = dayjs.utc(dateSelected).toDate();
      // console.log(dateSelected);
    }

    dataInputed["callsign"] = callsign;
    dataInputed["adep"] = adep;
    dataInputed["ades"] = ades;
    dataInputed["isVerified"] = true;
    // dataInputed["dof"] = dof;
    await prisma.aftn.create({
      data: dataInputed
    })
    console.log(`${dayjs.utc().format('YYYY-MM-DD HH:mm:ss')} DLA ${callsign}, ${adep}, ${ades}, ${dof}`)
  }else{
    console.log(datas)
    await prisma.aftn.create({
      data: dataInputed
    })
  }
}

async function cnl(regexFilterCnl, regexRealDof, datas, dataInputed){
  const exec = regexFilterCnl.exec(datas)
  if (exec) {
    const { callsign, adep, ades, dof } = exec.groups
    const execRealDof = regexRealDof.exec(dof);

    if(execRealDof || dof != 0){
      const {year, month, day} = execRealDof.groups;
      const dateSelected = `20${year}-${month}-${day}`
      dataInputed["dof"] = dayjs.utc(dateSelected).toDate();
      // console.log(dateSelected);
    }

    dataInputed["callsign"] = callsign;
    dataInputed["adep"] = adep;
    dataInputed["ades"] = ades;
    dataInputed["isVerified"] = true;
    // dataInputed["dof"] = dof;
    await prisma.aftn.create({
      data: dataInputed
    })
    console.log(`${dayjs.utc().format('YYYY-MM-DD HH:mm:ss')} CNL ${callsign}, ${adep}, ${ades}, ${dof}`)
  }else{
    console.log(datas)
    await prisma.aftn.create({
      data: dataInputed
    })
  }
}

async function chg(regexFilterChg, regexRealDof, datas, dataInputed){
  const exec = regexFilterChg.exec(datas);
  if(exec){
    const { callsign, adep, ades, dof } = exec.groups
    const execRealDof = regexRealDof.exec(dof);

    if(execRealDof || dof != 0){
      const {year, month, day} = execRealDof.groups;
      const dateSelected = `20${year}-${month}-${day}`
      dataInputed["dof"] = dayjs.utc(dateSelected).toDate();
      // console.log(dateSelected);
    }

    dataInputed["callsign"] = callsign;
    dataInputed["adep"] = adep;
    dataInputed["ades"] = ades;
    dataInputed["isVerified"] = true;

    await prisma.aftn.create({
      data: dataInputed
    })
    console.log(`${dayjs.utc().format('YYYY-MM-DD HH:mm:ss')} CHG ${callsign}, ${adep}, ${ades}, ${dof}`)
  }
}
module.exports = { aftn }