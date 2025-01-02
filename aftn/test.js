const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const fs = require('fs');

const test = async() => {
    const aftn = await prisma.aftn.findFirst({
      orderBy: {
        id: 'asc'
      }
    });
    const regexFilterFpl = /\(\w*-(?<callsign>\w*)(\/\w*)?-(?<adep>\w{4})(?<dep>\d{4})-(?<ades>\w{4})(?:\s|\S)?-(?:DOF\/)?(?<dof>\d+)\)/gm

    const aftnData = aftn.message;
    const match = regexFilterFpl.exec(aftnData);
    if (match) {
        console.log(match.groups);
    } else {
        console.log("No match found. Double-check line breaks or try adjusting greedy vs. non-greedy matches.");
    }
}

test()