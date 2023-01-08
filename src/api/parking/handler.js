const autoBind = require('auto-bind');

class ParkingHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postParkingHandler(request, h) {
    this._validator.validatePostParkingPayload(request.payload);
    const { type, enterTime, exitTime } = request.payload;
    const parkingId = await this._service.addParkingData({ type, enterTime, exitTime });

    const response = h.response({
      status: 'success',
      data: {
        parkingId,
      },
    });
    response.code(201);
    return response;
  }

  async getParkingHandler(request, h) {
    this._validator.validateGetParkingPayload(request.payload);
    const {
      type, enterTime, exitTime, priceMin, priceMax,
    } = request.query;
    this._validator.validateGetParkingPayload({
      type, enterTime, priceMin, priceMax,
    });
    const parkingData = await this._service.getParkingData({
      type,
      timeRange: {
        start: enterTime,
        end: exitTime,
      },
      priceRange: {
        min: priceMin,
        max: priceMax,
      },
    });

    const response = h.response({
      status: 'success',
      data: {
        parkingData,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ParkingHandler;
