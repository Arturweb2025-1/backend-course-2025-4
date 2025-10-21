const { Command } = require('commander');
const http = require('http');
const fs = require('fs').promises;
const { XMLBuilder } = require('fast-xml-parser');

const program = new Command();
program
  .option('-i, --input <path>', 'input file path (JSON data)')
  .option('-h, --host <host>', 'server host (e.g. localhost)')
  .option('-p, --port <number>', 'server port (e.g. 3000)');

program.parse(process.argv);
const options = program.opts();

if (!options.input || !options.host || !options.port) {
  console.error('Error: missing required parameters (--input, --host, --port)');
  process.exit(1);
}

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));
  } catch (err) {
    console.error('Cannot find or parse input file');
    process.exit(1);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${options.host}:${options.port}`);
    const params = url.searchParams;

    const jsonData = await readJSON(options.input);

    let filtered = jsonData;

    if (params.has('max_mpg')) {
      const maxMpg = parseFloat(params.get('max_mpg'));
      filtered = filtered.filter(car => parseFloat(car.mpg) < maxMpg);
    }

    const includeCyl = params.get('cylinders') === 'true';

const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

const carsXmlObj = {
  cars: {
    car: filtered.map(car => {
      const obj = { model: car.model || 'unknown', mpg: car.mpg ?? 'N/A' };
      if (includeCyl) obj.cyl = car.cyl ?? 'N/A';
      return obj;
    })
  }
};

const xml = builder.build(carsXmlObj);

res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
res.end(xml);

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error: ' + err.message);
  }
});

server.listen(options.port, options.host, () => {
  console.log('Server running:');
  console.log(`Base URL:   http://${options.host}:${options.port}/`);
  console.log(`Cylinders:  http://${options.host}:${options.port}/?cylinders=true`);
  console.log(`Mpg:  http://${options.host}:${options.port}/?max_mpg=25`);
});