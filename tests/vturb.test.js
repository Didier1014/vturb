const { execSync } = require('child_process');

describe('vturb v2.0', () => {
  test('version should be 2.0', () => {
    const pkg = require('../package.json');
    expect(pkg.version).toBe('2.0.0');
  });

  test('--help should output usage', () => {
    const output = execSync('node index.js --help', { cwd: process.cwd() }).toString();
    expect(output).toContain('Usage');
  });

  test('--cpu should show CPU info', () => {
    const output = execSync('node index.js --cpu', { cwd: process.cwd() }).toString();
    expect(output).toContain('CPU');
  });

  test('--mem should show memory info', () => {
    const output = execSync('node index.js --mem', { cwd: process.cwd() }).toString();
    expect(output).toContain('Memory');
  });
});