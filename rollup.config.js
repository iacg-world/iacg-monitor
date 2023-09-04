import fs from 'fs';
import path from 'path';
const packagesDir = path.resolve(__dirname, 'packages');
const packageFiles = fs.readdirSync(packagesDir);
function output(path) {
  return [
    {
      input: [`./packages/${path}/src/index.js`],
      output: [
        {
          file: `./packages/${path}/dist/index.js`,
          format: 'umd',
          name: 'iacg-monitor',
        }
      ],
    }
  ];
}

export default [...packageFiles.map((path) => output(path)).flat()];