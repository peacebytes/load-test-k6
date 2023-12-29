import http from "k6/http";
import { check } from 'k6';

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

export default function () {
  
  const response = http.get(`${BASE_URL}/public/crocodiles/`);
  console.log(response);
  const isSuccessfulDelete = check(null, {
    'GET worked correctly.': () => response.status === 200,
  });

  if (!isSuccessfulDelete) {
    console.error(`GET got error !`);
    console.error(`${response.status}`);
    console.error(`${response.body}`);
  }
}