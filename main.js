const { Command } = require('commander');
const http = require('http');
const fs = require('fs');

const program = new Command();

program
  .option('-i, --input <path>', 'input file path (JSON data)')
  .option('-h, --host <host>', 'server host (e.g. localhost)')
  .option('-p, --port <number>', 'server port (e.g. 3000)');

program.parse(process.argv);
const options = program.opts();

// --- Перевірки ---
if (!options.input || !options.host || !options.port) {
  console.error('Error: missing required parameters (--input, --host, --port)');
  process.exit(1);
}

if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// --- Створення сервера ---
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end('HTTP server is running successfully!');
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
