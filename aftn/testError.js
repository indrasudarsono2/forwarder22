const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

const test = async () => {
  const regexAll = /(?<content>[A-Z]{2,}[\s\S]*)\n/gm
  const regexTypMsg = /^\d* (?<address>\w{8})[\s\S]*\((?<typMsg>\w{3})-/gm
  const regexFilterFpl = /\((?<typMsg>\w{3})-(?<callsign>\w+)[\s\S]*?\n[\s\S]*?\n-(?<adep>\w{4})(?<eobt>\d{4})\s*-\w* (?<route>[\s\S]*?)(?=-)-(?<ades>\w{4})(?<eat>\d{4})( (?<altn>[\w ]*))?\s*-[\w\S\s]*DOF\/(?<dof>\d{6})\s*(REG\/(?<areg>\w*)[\w\S\s]*\))?/gm
  const regexFilterArr = /\(\w*-(?<callsign>\w*)(\/\w*)?-(?<adep>\w{4})(?<dep>\d{4})?-(?<ades>\w{4})(?<arr>\d{4})(?:\s*.*)?\)/gm
  const regexFilterDla = /\(\w*-(?<callsign>\w*)(\/\w*)?-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w{4})(?:\s)?-(?:DOF\/)(?<dof>\d{6})\)/gm
  const regexFilterChg = /\(\w*-(?<callsign>\w*)-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w*)-(?<dof>[\w\S]*)-(?<content>[\w\W]*)\)/gm
  const regexFilterCnl = /\(\w*-(?<callsign>\w*)-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w*)-(?:DOF\/)?(?<dof>\d{6})\)/gm
  const regexRealDof = /(?<year>\d{2})(?<month>\d{2})(?<day>\d{2})/gm
  const regexWs = /\n/gm;
  const regexFilterDep = /\(\w*-(?<callsign>\w*)(\/\w*)?-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w{4})(?:\s*)?-(?:DOF\/)?(?<dof>\d+)\)/gm

  var file = fs.readFileSync('./testError.txt', 'utf-8');
  const regexRoute = /15\/\w* (?<route>[\w\W]*)-[\w\S\W]*/gm
  const exec = regexFilterChg.exec(file);
  const content = exec.groups.content;

  const exec2 = regexRoute.exec(content);
  var route = exec2.groups.route
  route = route.replace(/\s{2}/gm, " ");
  console.log(route);

  // const match = regexWs.test(file);
  // file = file.replace(/\n/g, " ")
  // const aftn = await prisma.aftn.findFirst({
  //   where: {
  //     id: 2
  //   }
  // })
  // console.log(aftn.message);
  // const exec = regexFilterFpl.exec(aftn.message);
  // console.log(exec.groups);

  // const aftn = await prisma.aftn.findMany({
  //   where: {
  //     id: 99999999
  //   }
  // })
  
  // if(aftn.length != 0){
  //   console.log('aftn')
  // }else{
  //   console.log('no')
  // }
  // console.log(aftn[0].id)
 
}


test()