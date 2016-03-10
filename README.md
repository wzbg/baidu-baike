# baidu-baike

百度百科

## Install

Install using npm:
```sh
    $ npm install baidu-baike
```

## Usage

```javascript
const baike = require('baidu-baike')
const query = '三体'
baike(query)
  .then(res => console.log(JSON.stringify(res)))
  .catch(err => console.error(err))
```

## Test

Run tests:
```sh
    $ npm test
```

Tested with node.js v4.0+

## License
The MIT License (MIT)

Copyright (c) 2016