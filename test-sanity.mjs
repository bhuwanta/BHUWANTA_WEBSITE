import { client } from './src/lib/sanity.js';
async function test() {
  const res = await client.fetch('*[_type == "autoresponder"][0]');
  console.log(res);
}
test();
