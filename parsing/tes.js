const fs = require('fs');
const regex = /(?<content>[A-Z]{2,} [\s\S]*)\n/gm;

const read =  fs.readFileSync('./test.txt', 'utf-8');

const exec = regex.exec(read);
console.log(exec.groups.content);
