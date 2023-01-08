const sinon = require('sinon');
const { assert } = require('chai');
const ParkingService = require('../src/services/postgres/ParkingService');
const InvariantError = require('../src/exceptions/InvariantError');

describe('Parking service', () => {
  describe('calculatePrice', () => {
    it('should throw an error given an invalid time difference', () => {
      try {
        ParkingService.calculatePrice(
          'car',
          new Date('January 07, 2023 00:00:00').getTime(),
          new Date('January 06, 2023 01:00:00').getTime(),
        );
      } catch (e) {
        assert.isTrue(e instanceof InvariantError);
      }
    });
    it('should throw an error given an invalid type', () => {
      try {
        ParkingService.calculatePrice(
          'invalid',
          new Date('January 07, 2023 00:00:00').getTime(),
          new Date('January 06, 2023 01:00:00').getTime(),
        );
      } catch (e) {
        assert.isTrue(e instanceof InvariantError);
      }
    });
    it('should calculate car hourly price given time difference of less than one day', () => {
      const price = ParkingService.calculatePrice(
        'car',
        new Date('January 07, 2023 00:00:00').getTime(),
        new Date('January 07, 2023 01:00:00').getTime(),
      );
      assert.equal(price, 5000);
    });
    it('should calculate motorcycle hourly price given time difference of less than one day', () => {
      const price = ParkingService.calculatePrice(
        'motorcycle',
        new Date('January 07, 2023 00:00:00').getTime(),
        new Date('January 07, 2023 01:00:00').getTime(),
      );
      assert.equal(price, 2000);
    });
    it('should calculate car hourly price given time difference of less than one day and less than one minute', () => {
      const price = ParkingService.calculatePrice(
        'car',
        new Date('January 07, 2023 00:00:00').getTime(),
        new Date('January 07, 2023 01:00:59').getTime(),
      );
      assert.equal(price, 5000);
    });
    it('should calculate motorcycle hourly price given time difference of less than one day and less than one minute', () => {
      const price = ParkingService.calculatePrice(
        'motorcycle',
        new Date('January 07, 2023 00:00:00').getTime(),
        new Date('January 07, 2023 01:00:59').getTime(),
      );
      assert.equal(price, 2000);
    });
    it('should calculate car hourly price given time difference of less than one day and more or equal to one minute', () => {
      const price = ParkingService.calculatePrice(
        'car',
        new Date('January 07, 2023 00:00:00').getTime(),
        new Date('January 07, 2023 01:01:00').getTime(),
      );
      assert.equal(price, 10000);
    });
    it('should calculate motorcycle hourly price given time difference of less than one day and more or equal to one minute', () => {
      const price = ParkingService.calculatePrice(
        'motorcycle',
        new Date('January 07, 2023 00:00:00').getTime(),
        new Date('January 07, 2023 01:01:00').getTime(),
      );
      assert.equal(price, 4000);
    });
    it('should calculate car daily price given time difference of more than one day', () => {
      const price = ParkingService.calculatePrice(
        'car',
        new Date('January 07, 2023 00:00:00').getTime(),
        new Date('January 08, 2023 00:00:00').getTime(),
      );
      assert.equal(price, 80000);
    });
    it('should calculate motorcycle daily price given time difference of more than one day', () => {
      const price = ParkingService.calculatePrice(
        'motorcycle',
        new Date('January 07, 2023 00:00:00').getTime(),
        new Date('January 08, 2023 00:00:00').getTime(),
      );
      assert.equal(price, 40000);
    });
    it('should calculate car daily price and hourly price given time difference consisting of day, hour, and minute differences', () => {
      const price = ParkingService.calculatePrice(
        'car',
        new Date('January 07, 2023 00:00:00').getTime(),
        new Date('January 08, 2023 01:01:59').getTime(),
      );
      assert.equal(price, 90000);
    });
    it('should calculate motorcycle daily price and hourly price given time difference consisting of day, hour, and minute differences', () => {
      const price = ParkingService.calculatePrice(
        'motorcycle',
        new Date('January 07, 2023 00:00:00').getTime(),
        new Date('January 08, 2023 01:01:59').getTime(),
      );
      assert.equal(price, 44000);
    });
  });
  describe('addParkingData', () => {
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
  });
  describe('getParkingData', () => {
    it('should call a get query with no where condition to the database with empty object and return row of data', async () => {
      const mockDb = {
        query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
      };
      const parkingService = new ParkingService(mockDb);

      const result = await parkingService.getParkingData({});
      assert.isArray(result);

      sinon.assert.calledWith(mockDb.query, {
        text: 'SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time, '
          + 'extract(EPOCH FROM exit_time) * 1000 AS exit_time, price '
          + 'FROM parking WHERE TRUE',
        values: [],
      });
    });
    it('should call a get query with type where condition and return row of data', async () => {
      const mockDb = {
        query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
      };
      const parkingService = new ParkingService(mockDb);

      const result = await parkingService.getParkingData({ type: 'motorcycle' });
      assert.isArray(result);

      sinon.assert.calledWith(mockDb.query, {
        text: 'SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time, '
          + 'extract(EPOCH FROM exit_time) * 1000 AS exit_time, price '
          + 'FROM parking WHERE TRUE AND type = $1',
        values: ['motorcycle'],
      });
    });
    it('should call a get query with type and start time range where condition and return row of data', async () => {
      const mockDb = {
        query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
      };
      const parkingService = new ParkingService(mockDb);

      const result = await parkingService.getParkingData({ type: 'motorcycle', timeRange: { start: 1672941905000 } });
      assert.isArray(result);

      sinon.assert.calledWith(mockDb.query, {
        text: 'SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time, '
          + 'extract(EPOCH FROM exit_time) * 1000 AS exit_time, price '
          + 'FROM parking WHERE TRUE AND type = $1 '
          + "AND enter_time >= (to_timestamp($2 / 1000.0) AT TIME ZONE 'UTC')",
        values: ['motorcycle', 1672941905000],
      });
    });
    it('should call a get query with type and end time range where condition and return row of data', async () => {
      const mockDb = {
        query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
      };
      const parkingService = new ParkingService(mockDb);

      const result = await parkingService.getParkingData({ type: 'motorcycle', timeRange: { end: 1682941904000 } });
      assert.isArray(result);

      sinon.assert.calledWith(mockDb.query, {
        text: 'SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time, '
          + 'extract(EPOCH FROM exit_time) * 1000 AS exit_time, price '
          + 'FROM parking WHERE TRUE AND type = $1 '
          + "AND exit_time <= (to_timestamp($2 / 1000.0) AT TIME ZONE 'UTC')",
        values: ['motorcycle', 1682941904000],
      });
    });
    it('should call a get query with type and start-end time range where condition and return row of data', async () => {
      const mockDb = {
        query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
      };
      const parkingService = new ParkingService(mockDb);

      const result = await parkingService.getParkingData({ type: 'motorcycle', timeRange: { start: 1672941905000, end: 1682941904000 } });
      assert.isArray(result);

      sinon.assert.calledWith(mockDb.query, {
        text: 'SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time, '
          + 'extract(EPOCH FROM exit_time) * 1000 AS exit_time, price '
          + 'FROM parking WHERE TRUE AND type = $1 '
          + "AND enter_time >= (to_timestamp($2 / 1000.0) AT TIME ZONE 'UTC') "
          + "AND exit_time <= (to_timestamp($3 / 1000.0) AT TIME ZONE 'UTC')",
        values: ['motorcycle', 1672941905000, 1682941904000],
      });
    });
    it('should call a get query with type, start-end time range, and min price where condition and return row of data', async () => {
      const mockDb = {
        query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
      };
      const parkingService = new ParkingService(mockDb);

      const result = await parkingService.getParkingData({ type: 'motorcycle', timeRange: { start: 1672941905000, end: 1682941904000 }, priceRange: { min: 1000 } });
      assert.isArray(result);

      sinon.assert.calledWith(mockDb.query, {
        text: 'SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time, '
          + 'extract(EPOCH FROM exit_time) * 1000 AS exit_time, price '
          + 'FROM parking WHERE TRUE AND type = $1 '
          + "AND enter_time >= (to_timestamp($2 / 1000.0) AT TIME ZONE 'UTC') "
          + "AND exit_time <= (to_timestamp($3 / 1000.0) AT TIME ZONE 'UTC') "
          + 'AND price >= $4',
        values: ['motorcycle', 1672941905000, 1682941904000, 1000],
      });
    });
    it('should call a get query with type, start-end time range, and max price where condition and return row of data', async () => {
      const mockDb = {
        query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
      };
      const parkingService = new ParkingService(mockDb);

      const result = await parkingService.getParkingData({ type: 'motorcycle', timeRange: { start: 1672941905000, end: 1682941904000 }, priceRange: { max: 500000 } });
      assert.isArray(result);

      sinon.assert.calledWith(mockDb.query, {
        text: 'SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time, '
          + 'extract(EPOCH FROM exit_time) * 1000 AS exit_time, price '
          + 'FROM parking WHERE TRUE AND type = $1 '
          + "AND enter_time >= (to_timestamp($2 / 1000.0) AT TIME ZONE 'UTC') "
          + "AND exit_time <= (to_timestamp($3 / 1000.0) AT TIME ZONE 'UTC') "
          + 'AND price <= $4',
        values: ['motorcycle', 1672941905000, 1682941904000, 500000],
      });
    });
    it('should call a get query with type, start-end time range, and min-max price where condition and return row of data', async () => {
      const mockDb = {
        query: sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] }),
      };
      const parkingService = new ParkingService(mockDb);

      const result = await parkingService.getParkingData({ type: 'motorcycle', timeRange: { start: 1672941905000, end: 1682941904000 }, priceRange: { min: 1000, max: 500000 } });
      assert.isArray(result);

      sinon.assert.calledWith(mockDb.query, {
        text: 'SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time, '
          + 'extract(EPOCH FROM exit_time) * 1000 AS exit_time, price '
          + 'FROM parking WHERE TRUE AND type = $1 '
          + "AND enter_time >= (to_timestamp($2 / 1000.0) AT TIME ZONE 'UTC') "
          + "AND exit_time <= (to_timestamp($3 / 1000.0) AT TIME ZONE 'UTC') "
          + 'AND price >= $4 '
          + 'AND price <= $5',
        values: ['motorcycle', 1672941905000, 1682941904000, 1000, 500000],
      });
    });
  });
});
