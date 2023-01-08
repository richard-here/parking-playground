const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const mapParkingDBToModel = require('../../utils');

class ParkingService {
  constructor(pool) {
    this._pool = pool || new Pool();
  }

  static calculatePrice(type, enterTime, exitTime) {
    const range = exitTime - enterTime;
    const days = Math.floor(range / 86400000);
    const hours = Math.floor((range % 86400000) / 3600000);
    const minutes = Math.floor((range % 3600000) / 60000);
    let price;
    if (type.toLowerCase() === 'car') {
      price = days * 80000 + hours * 5000 + (minutes >= 1 ? 5000 : 0);
    } else {
      price = days * 40000 + hours * 2000 + (minutes >= 1 ? 2000 : 0);
    }
    return price;
  }

  async addParkingData({
    type, enterTime, exitTime,
  }) {
    const price = ParkingService.calculatePrice(type, enterTime, exitTime);
    const query = {
      text: "INSERT INTO parking(type, enter_time, exit_time, price) VALUES(lower($1), to_timestamp($2 / 1000.0) AT TIME ZONE 'UTC', to_timestamp($3 / 1000.0) AT TIME ZONE 'UTC', $4) RETURNING id",
      values: [type, enterTime, exitTime, price],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Insertion of parking data failed');
    }
    return result.rows[0].id;
  }

  async getParkingData({ type, timeRange, priceRange }) {
    const query = {
      text: `
        SELECT id, type, extract(EPOCH FROM enter_time) * 1000 AS enter_time,
          extract(EPOCH FROM exit_time) * 1000 AS exit_time, price
        FROM parking WHERE TRUE`,
      values: [],
    };
    let textToAppend = '';
    const valuesToPush = [];
    let index = 1;
    if (type) {
      textToAppend += ` AND type = $${index}`;
      valuesToPush.push(type);
      index += 1;
    }
    if (timeRange) {
      if (timeRange.start) {
        textToAppend += ` AND enter_time >= (to_timestamp($${index} / 1000.0) AT TIME ZONE 'UTC')`;
        valuesToPush.push(timeRange.start);
        index += 1;
      }
      if (timeRange.end) {
        textToAppend += ` AND exit_time <= (to_timestamp($${index} / 1000.0) AT TIME ZONE 'UTC')`;
        valuesToPush.push(timeRange.end);
        index += 1;
      }
    }
    if (priceRange) {
      if (priceRange.min) {
        textToAppend += ` AND price >= $${index}`;
        valuesToPush.push(priceRange.min);
        index += 1;
      }
      if (priceRange.max) {
        textToAppend += ` AND price <= $${index}`;
        valuesToPush.push(priceRange.max);
        index += 1;
      }
    }
    query.text += textToAppend;
    query.values.push(...valuesToPush);
    const result = await this._pool.query(query);
    return result.rows.map(mapParkingDBToModel);
  }
}

module.exports = ParkingService;
