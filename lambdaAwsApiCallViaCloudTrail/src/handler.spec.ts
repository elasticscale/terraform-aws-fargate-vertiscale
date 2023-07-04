import { handler } from './handler';
import fs from 'fs';

describe('handler', () => {
  test('inserts to dynamodb', async () => {
    const data = JSON.parse(
      fs.readFileSync('./examples/example1.json', 'utf8'),
    );
    handler(data);
  });
});
