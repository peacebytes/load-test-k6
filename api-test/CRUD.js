import http from 'k6/http';
import { check, group } from 'k6';

const DEBUG_MODE = __ENV.DEBUG_MODE;
const BASE_URL = __ENV.BASE_URL;
const VIRTUAL_USERS = __ENV.VIRTUAL_USERS || 40;

const DURATION_FULLY_RAMP_UP = __ENV.DURATION_FULLY_RAMP_UP || 1;
const DURATION_STAY_ON_PEAK = __ENV.DURATION_STAY_ON_PEAK || 5;
const DURATION_FULLY_RAMP_DOWN = __ENV.DURATION_FULLY_RAMP_DOWN || 1;

const DURATION_FOR_REQUEST_FULFILLED = __ENV.DURATION_FOR_REQUEST_FULFILLED || 400;

export const options = {
  insecureSkipTLSVerify: true,
  discardResponseBodies: !DEBUG_MODE,

  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than {N}%
    http_req_duration: [`p(95)<${DURATION_FOR_REQUEST_FULFILLED}`], // 95% of requests should be below {N}ms
  },

  stages: [
    { duration: `${DURATION_FULLY_RAMP_UP}s`, target: VIRTUAL_USERS }, // duration ramping up from 0 to target VIRTUAL_USERS
    { duration: `${DURATION_STAY_ON_PEAK}s`, target: VIRTUAL_USERS }, // duration staying on peak with target VIRTUAL_USERS
    { duration: `${DURATION_FULLY_RAMP_DOWN}s`, target: 0 },   // duration ramping down from target VIRTUAL_USERS to 0
  ],
};

// Create a random string of given length
function randomString(length, charset = '') {
  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';
  let res = '';
  while (length--) res += charset[(Math.random() * charset.length) | 0];
  return res;
}

const USERNAME = `${randomString(10)}@example.com`; // Set your own email or `${randomString(10)}@example.com`;
const PASSWORD = 'superCroc2019';

// Register a new user and retrieve authentication token for subsequent API requests
export function setup() {
  const res = http.post(`${BASE_URL}/user/register/`, {
    first_name: 'Crocodile',
    last_name: 'Owner',
    username: USERNAME,
    password: PASSWORD,
  });

  check(res, { 'created user': (r) => r.status === 201 });

  const loginRes = http.post(`${BASE_URL}/auth/token/login/`, {
    username: USERNAME,
    password: PASSWORD,
  });

  const authToken = loginRes.json('access');
  check(authToken, { 'logged in successfully': () => authToken !== '' });

  return authToken;
}

export default (authToken) => {
  // set the authorization header on the session for the subsequent requests
  const requestConfigWithTag = (tag) => ({
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    tags: Object.assign(
      {},
      {
        name: 'PrivateCrocs',
      },
      tag
    ),
  });

  let URL = `${BASE_URL}/my/crocodiles/`;

  group('01. Create a new crocodile', () => {
    const payload = {
      name: `Name ${randomString(10)}`,
      sex: 'F',
      date_of_birth: '2023-05-11',
    };

    const res = http.post(URL, payload, requestConfigWithTag({ name: 'Create' }));

    if (check(res, { 'Croc created correctly': (r) => r.status === 201 })) {
      URL = `${URL}${res.json('id')}/`;
    } else {
      console.log(`Unable to create a Croc ${res.status} ${res.body}`);
      return;
    }
  });

  group('02. Fetch private crocs', () => {
    const res = http.get(`${BASE_URL}/my/crocodiles/`, requestConfigWithTag({ name: 'Fetch' }));
    check(res, { 'retrieved crocs status': (r) => r.status === 200 });
    check(res.json(), { 'retrieved crocs list': (r) => r.length > 0 });
  });

  group('03. Update the croc', () => {
    const payload = { name: 'New name' };
    const res = http.patch(URL, payload, requestConfigWithTag({ name: 'Update' }));
    const isSuccessfulUpdate = check(res, {
      'Update worked': () => res.status === 200,
      'Updated name is correct': () => res.json('name') === 'New name',
    });

    if (!isSuccessfulUpdate) {
      console.log(`Unable to update the croc ${res.status} ${res.body}`);
      return;
    }
  });

  group('04. Delete the croc', () => {
    const delRes = http.del(URL, null, requestConfigWithTag({ name: 'Delete' }));

    const isSuccessfulDelete = check(null, {
      'Croc was deleted correctly': () => delRes.status === 204,
    });

    if (!isSuccessfulDelete) {
      console.log(`Croc was not deleted properly`);
      return;
    }
  });
};