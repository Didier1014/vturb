#!/usr/bin/env node
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const os = require('os');

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

let intervalId = null;
let running = false;

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
    times: {
      user: totalStats.user,
      nice: totalStats.nice,
      sys: totalStats.sys,
      idle: totalStats.idle,
      irq: totalStats.irq,
    },
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
    totalmem: formatBytes(os.totalmem()),
    freemem: formatBytes(os.freemem()),
    homedir: os.homedir(),
  };
}

function renderHeader() {
  const cpu = getCpuInfo();
  const mem = getMemInfo();
  const system = getSystemInfo();
  const now = new Date().toLocaleTimeString();
  
  const header = [
    `vturb v${pkg.version} | ${now}`,
    `CPU: ${cpu.model} (${cpu.totalCpus} cores) - ${cpu.usagePct}%`,
    `MEM: ${mem.used} / ${mem.total} (${mem.usagePct}%)`,
    `---`,
  ].join(' | ');
  
  process.stdout.write(`\x1b[2J\x1b[0;0H${header}\n`);
}

function renderDetails() {
  const cpu = getCpuInfo();
  const mem = getMemInfo();
  const system = getSystemInfo();
  
  const details = [
    `\nCPU Details:`,
    `  Model: ${cpu.model}`,
    `  Speed: ${cpu.speed} MHz`,
    `  Cores: ${cpu.totalCpus}`,
    `  Usage: ${cpu.usagePct}%`,
    `    - User: ${cpu.times.user.toFixed(1)}s`,
    `    - Sys:  ${cpu.times.sys.toFixed(1)}s`,
    `    - Idle: ${cpu.times.idle.toFixed(1)}s`,
    `\nMemory Details:`,
    `  Total: ${mem.total}`,
    `  Free: ${mem.free}`,
    `  Used: ${mem.used}`,
    `  Usage: ${mem.usagePct}%`,
    `\nSystem Details:`,
    `  Platform: ${system.platform} ${system.release}`,
    `  Home: ${system.homedir}`,
    `\n---`,
    'Press Ctrl+C to exit',
  ].join('\n');
  
  process.stdout.write(details + '\n');
}

function startMonitoring() {
  if (running) return;
  running = true;
  renderHeader();
  renderDetails();
  intervalId = setInterval(() => {
    renderHeader();
    renderDetails();
  }, 1000);
}

function stopMonitoring() {
  running = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  process.stdout.write('\n');
}

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: vturb [options]');
  console.log('');
  console.log('Options:');
  console.log('  --monitor   Start continuous monitoring mode');
  console.log('  --cpu       Show CPU information');
  console.log('  --mem       Show memory information');
  console.log('  --system    Show system information');
  console.log('  --help      Show this help message');
} else if (args.includes('--monitor')) {
  startMonitoring();
  process.stdin.resume();
  process.stdin.on('data', (signal) => {
    if (signal.toString().trim() === 'q') {
      stopMonitoring();
      process.exit(0);
    }
  });
} else if (args.includes('--cpu')) {
  const cpu = getCpuInfo();
  console.log(`\nCPU: ${cpu.model}`);
  console.log(`Cores: ${cpu.totalCpus}`);
  console.log(`Speed: ${cpu.speed} MHz`);
  console.log(`Usage: ${cpu.usagePct}%`);
  console.log(`Times: user=${cpu.times.user.toFixed(1)}s, sys=${cpu.times.sys.toFixed(1)}s, idle=${cpu.times.idle.toFixed(1)}s`);
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
  console.log(`  Platform: ${system.platform} ${system.release}`);
  console.log(`  Total Memory: ${system.totalmem}`);
  console.log(`  Free Memory: ${system.freemem}`);
} else {
  console.log('vturb v2.0 - Terminal system monitor');
  console.log('Use --help for available options');
}