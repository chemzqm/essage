# Essage

  Component fork of [sofish/essage](https://github.com/sofish/essage) with API changed.

  [demo](http://chemzqm.github.io/essage/)

## Installation

  Install with [component(1)](http://component.io):

    $ component install chemzqm/essage

## Usage

``` js
var Essage = require('essage');

Essage.show('hello, im a message', {
  timeout: 2000,
  placement: 'bottom',
  status: 'success'
})
```

## API

### Essage.show(msg, [options])

Show `msg` with optional options.

options:

  - `timeout` hide the message in timeout ms.
  - `placement` the placement can be `top` or `bottom`, by default is `top`.
  - `status` could be `info` `warning` `success` `error` would add class `essage-[status]` container.

### Editable.hide()

Hide the message.

## License

  MIT
