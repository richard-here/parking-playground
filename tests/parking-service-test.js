const sinon = require('sinon');
const { assert } = require('chai');
const ParkingService = require('../src/services/postgres/ParkingService');

describe('Parking validator', () => {
  it('should call an insert query statement to the database and return the id', async () => {
    const mockDb = {
      query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
    };
    const parkingService = new ParkingService(mockDb);
    const type = 'car';
    const enterTime = Date.now();
    const exitTime = Date.now() + 3600;
    const price = ParkingService.calculatePrice(type, enterTime, exitTime);

    const result = await parkingService.addParkingData({
      type, enterTime, exitTime,
    });
    assert.isNumber(result);

    sinon.assert.calledWith(mockDb.query, {
      text: "INSERT INTO parking(type, enter_time, exit_time, price) VALUES(lower($1), to_timestamp($2 / 1000.0) AT TIME ZONE 'UTC', to_timestamp($3 / 1000.0) AT TIME ZONE 'UTC', $4) RETURNING id",
      values: [type, enterTime, exitTime, price],
    });
  });
  it('should call a get query with no where condition to the database with empty object and return row of data', async () => {
    const mockDb = {
      query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
    };
    const parkingService = new ParkingService(mockDb);

    const result = await parkingService.getParkingData({});
    assert.isArray(result);

    sinon.assert.calledWith(mockDb.query, {
      text: `
        SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time,
          extract(EPOCH FROM exit_time) * 1000 AS exit_time, price
        FROM parking WHERE TRUE`,
      values: [],
    });
  });
  it('should call a get query with type where condition to the database with object with type key and return row of data', async () => {
    const mockDb = {
      query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
    };
    const parkingService = new ParkingService(mockDb);

    const result = await parkingService.getParkingData({ type: 'motorcycle' });
    assert.isArray(result);

    sinon.assert.calledWith(mockDb.query, {
      text: `
        SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time,
          extract(EPOCH FROM exit_time) * 1000 AS exit_time, price
        FROM parking WHERE TRUE AND type = $1`,
      values: ['motorcycle'],
    });
  });
});
