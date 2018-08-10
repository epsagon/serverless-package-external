# serverless-package-external 📦

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/serverless-package-external.svg)](https://badge.fury.io/js/serverless-package-external)

> Deploy a Serverless Python Function services with external code

Before deploying, this plugin symlinks folders containing shared code into the root directory of your Serverless function.

### Installation

```
npm i serverless-package-external --save-dev
```

### Usage

```yml
service: service-name

plugins:
  - serverless-package-external

functions:
  # Your functions here

custom:
  packageExternal:
    external:
      - '../common'
      - '../service-a/module'
```

#### Example Directory Structure

```
└── common
    └── resource.py
└── service-a
    └── handler.py
    └── serverless.yml
    └── module
        └── main.py
└── service-b
    └── handler.py
    └── serverless.yml
```

In handler.py, external code can be imported:
```py
from common.resource import shared_resource
```

#### Licensing

serverless-package-external is licensed under the [MIT License](./LICENSE.txt).

It is originally based on [serverless-package-common](https://github.com/onlicar/serverless-package-common).