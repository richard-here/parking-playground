const autoBind = require('auto-bind');

class ParkingHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }
}

module.exports = ParkingHandler;
