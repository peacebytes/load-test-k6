# performance-test-k6
Applying Grafana k6 to run load tests to measure performance.
This repo shows examples how to trigger load on target API environment. Target Web application environment to be updated.
This repo is not discussing about performance monitoring or benchmarking. 

## Installation

To install k6 on your system, follow this link
https://grafana.com/docs/k6/latest/get-started/installation/

## Running
```
export DURATION_FULLY_RAMP_UP=3
export DURATION_STAY_ON_PEAK=4
export DURATION_FULLY_RAMP_DOWN=3
export BASE_URL=https://test-api.k6.io
export DEBUG_MODE=1
export VIRTUAL_USERS=5
export DURATION_FOR_REQUEST_FULFILLED=150
```

run GET
```
k6 run ./api-test/GET.js
```

run CRUD
```
k6 run ./api-test/CRUD.js
```

Use these 2 sample load tests to expand with your target environment under test.

Happy Performance Testing !
