#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function getCpuInfo() {
  const cpus = os.cpus();
  const totalStats = cpus.reduce((acc, cpu) => {
    acc.user += cpu.times.user;
    acc.nice += cpu.times.nice;
    acc.sys += cpu.times.sys;
    acc.idle += cpu.times.idle;
    acc.irq += cpu.times.irq;
    return acc;
  }, { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 });
  
  const total = totalStats.user + totalStats.nice + totalStats.sys + totalStats.idle + totalStats.irq;
  const pct = total > 0 ? ((total - totalStats.idle) / total * 100).toFixed(1) : 0;
  
  return {
    model: cpus[0] ? cpus[0].model : 'Unknown',
    speed: cpus[0] ? cpus[0].speed : 0,
    totalCpus: cpus.length,
    usagePct: pct,
  };
}

function getMemInfo() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  return {
    total: formatBytes(totalMem),
    free: formatBytes(freeMem),
    used: formatBytes(usedMem),
    usagePct: ((usedMem / totalMem) * 100).toFixed(1),
  };
}

function getSystemInfo() {
  return {
    platform: os.platform(),
    release: os.release(),
  };
}

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: vturb [options]');
  console.log('');
  console.log('Options:');
  console.log('  --cpu       Show CPU information');
  console.log('  --mem       Show memory information');
  console.log('  --system    Show system information');
  console.log('  --help      Show this help message');
} else if (args.includes('--cpu')) {
  const cpu = getCpuInfo();
  console.log(`\nCPU: ${cpu.model}`);
  console.log(`Cores: ${cpu.totalCpus}`);
  console.log(`Speed: ${cpu.speed} MHz`);
  console.log(`Usage: ${cpu.usagePct}%`);
} else if (args.includes('--mem')) {
  const mem = getMemInfo();
  console.log(`\nMemory:`);
  console.log(`  Total: ${mem.total}`);
  console.log(`  Free: ${mem.free}`);
  console.log(`  Used: ${mem.used}`);
  console.log(`  Usage: ${mem.usagePct}%`);
} else if (args.includes('--system')) {
  const system = getSystemInfo();
  console.log(`\nSystem:`);
  console.log(`  Platform: ${system.platform}`);
  console.log(`  Release: ${system.release}`);
} else {
  console.log(`vturb v${pkg.version}`);
  console.log('Use --help for available options');
}