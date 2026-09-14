# vturb v2.0

Terminal system monitor for Node.js.

## Features

- **--cpu**: Show CPU information (model, cores, speed, usage)
- **--mem**: Show memory information (total, free, used, usage%)
- **--system**: Show system platform and release
- **--monitor**: Continuous monitoring mode with 1s refresh
- **--help**: Show usage information

## Installation

```bash
npm install -g .
# or
npm link
```

## Usage

```bash
vturb --cpu
vturb --mem
vturb --system
vturb --monitor  # Press 'q' to exit
vturb --help
```

## License

ISC