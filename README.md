# performance-test-k6
Applying Grafana k6 to run load tests

# Installation
https://grafana.com/docs/k6/latest/get-started/installation/

# Running
```
export DURATION_FULLY_RAMP_UP=3
export DURATION_STAY_ON_PEAK=4
export DURATION_FULLY_RAMP_DOWN=3
export BASE_URL=https://test-api.k6.io
export DEBUG_MODE=1
export VIRTUAL_USERS=5
export DURATION_FOR_REQUEST_FULFILLED=150
```

GET
```
k6 run ./api-test/GET.js
```

CRUD
```
k6 run ./api-test/CRUD.js
```