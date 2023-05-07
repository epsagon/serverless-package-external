# serverless-package-external 📦

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](https://badge.fury.io/js/serverless-package-external.svg)](https://badge.fury.io/js/serverless-package-external)
[![Build Status](https://travis-ci.com/epsagon/serverless-package-external.svg?branch=master)](https://travis-ci.com/epsagon/serverless-package-external)

> Deploy a Serverless Python Function services with external code

Before deploying, this plugin symlinks folders containing shared code into the root directory of your Serverless function.
This plugin works also with `serverless-offline` plugin.

### Installation

```
npm i serverless-package-external --save-dev
```

### Usage

```yml
service: service-name

plugins:
  - serverless-package-external

ecr:
  images:
    # Your images here

functions:
  # Your functions here

custom:
  packageExternal:
    common_utils:
      source: './common_utils'
      # if no functions specified, it will apply it to all
      functions:
        - service-a
        - service-b
    api_utils:
      source: './api_utils'
      functions:
        - service-b
```

#### Example Directory Structure

```
└── common_utils
    └── resource.py
└── api_utils
    └── resource.py
└── service-a
    └── handler.py
└── service-b
    └── handler.py
serverless.yml
```

In service-b/handler.py, external code can be imported:
```py
from common_utils.resource import shared_resource
from api_utils.resource import shared_resource
```
 
#### Licensing

serverless-package-external is licensed under the [MIT License](./LICENSE.txt).

It is originally based on [serverless-package-common](https://github.com/onlicar/serverless-package-common).
