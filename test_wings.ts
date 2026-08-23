import { getWingsListAction } from './src/app/(REALESTATE_SOFTWARE)/REALESTATE_SOFTWARE/role/it/modules/user_management/actions';

async function run() {
  const res = await getWingsListAction();
  console.log(JSON.stringify(res, null, 2));
}
run();
