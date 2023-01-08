const { assert } = require('chai');
const sinon = require('sinon');
const ParkingHandler = require('../src/api/parking/handler');
const InvariantError = require('../src/exceptions/InvariantError');

describe('Parking handler', () => {
  let service;
  let validator;
  let parkingHandler;
  let h;

  beforeEach(() => {
    service = {
      addParkingData: sinon.stub(),
      getParkingData: sinon.stub(),
    };

    validator = {
      validatePostParkingPayload: sinon.stub(),
      validateGetParkingPayload: sinon.stub(),
    };

    parkingHandler = new ParkingHandler(service, validator);

    h = {
      response: sinon.stub().returns({
        code: sinon.stub(),
      }),
    };
  });

  describe('postParkingHandler', () => {
    it('should return a response of 201 when adding data and payload given is valid', async () => {
      const request = { payload: { type: 'motorcycle', enterTime: 1672941905000, exitTime: 1682941904000 } };
      service.addParkingData.returns(1);
      validator.validatePostParkingPayload.returns(true);

      const result = await parkingHandler.postParkingHandler(request, h);
      assert.isTrue(h.response.calledWith({
        status: 'success',
        data: {
          parkingId: 1,
        },
      }));
      assert.isTrue(result.code.calledWith(201));
    });
    it('should not call service\'s function to add data when payload given is invalid', async () => {
      const request = { payload: { type: 'motorcycle', enterTime: 1672941905000, exitTime: 1672941904000 } };
      validator.validatePostParkingPayload.throws(new InvariantError('exitTime invalid'));

      try {
        await parkingHandler.postParkingHandler(request, h);
      } catch (e) {
        sinon.assert.notCalled(service.addParkingData);
        sinon.assert.notCalled(h.response);
      }
    });
  });
  describe('getParkingHandler', () => {
    it('should return a response of 200 when getting data without query parameters', async () => {
      const request = { query: {} };
      validator.validateGetParkingPayload.returns(true);
      service.getParkingData.returns([{}, {}]);

      const result = await parkingHandler.getParkingHandler(request, h);
      assert.isTrue(h.response.calledWith({
        status: 'success',
        data: {
          parkingData: [{}, {}],
        },
      }));
      assert.isTrue(result.code.calledWith(200));
    });
    it('should return a response of 200 when getting data with type query param', async () => {
      const request = { query: { type: 'motorcycle' } };
      validator.validateGetParkingPayload.returns(true);
      service.getParkingData.returns([{}, {}]);

      const result = await parkingHandler.getParkingHandler(request, h);
      assert.isTrue(h.response.calledWith({
        status: 'success',
        data: {
          parkingData: [{}, {}],
        },
      }));
      assert.isTrue(result.code.calledWith(200));
    });
    it('should return a response of 200 when getting data with type, and time range query params', async () => {
      const request = { query: { type: 'motorcycle', timeRange: { start: 1672941905000, end: 1682941904000 } } };
      validator.validateGetParkingPayload.returns(true);
      service.getParkingData.returns([{}, {}]);

      const result = await parkingHandler.getParkingHandler(request, h);
      assert.isTrue(h.response.calledWith({
        status: 'success',
        data: {
          parkingData: [{}, {}],
        },
      }));
      assert.isTrue(result.code.calledWith(200));
    });
    it('should return a response of 200 when getting data with type, time range, and price range query params', async () => {
      const request = {
        query: {
          type: 'motorcycle',
          timeRange: { start: 1672941905000, end: 1682941904000 },
          priceRange: { min: 1000, max: 200000 },
        },
      };
      validator.validateGetParkingPayload.returns(true);
      service.getParkingData.returns([{}, {}]);

      const result = await parkingHandler.getParkingHandler(request, h);
      assert.isTrue(h.response.calledWith({
        status: 'success',
        data: {
          parkingData: [{}, {}],
        },
      }));
      assert.isTrue(result.code.calledWith(200));
    });
    it('should return a response of 200 when getting data with invalid query params', async () => {
      const request = {
        query: {
          type: 'others',
          timeRange: { start: 1672941905000, end: 1672941900000 },
          priceRange: { min: 1000, max: 500 },
        },
      };
      validator.validateGetParkingPayload.throws(new InvariantError('invalid query params'));
      service.getParkingData.returns([{}, {}]);

      try {
        await parkingHandler.getParkingHandler(request, h);
      } catch (e) {
        sinon.assert.notCalled(service.getParkingData);
        sinon.assert.notCalled(h.response);
      }
    });
  });
});
