import { transformFile } from './index';
import * as fs from "node:fs";

const testFiles = fs.readdirSync('./test').map((filename) => {
  const inputCode = fs.readFileSync(`./test/${filename}`, 'utf-8');
  return [filename, inputCode];
});

it.each(testFiles)('transform correctly', async (filename, inputCode) => {
  const result = await transformFile(filename, inputCode);
  expect(result).toMatchSnapshot();
});