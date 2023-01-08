const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const mapParkingDBToModel = require('../../utils');

class ParkingService {
  constructor() {
    this._pool = new Pool();
  }

  static calculatePrice(type, enterTime, exitTime) {
    const range = exitTime - enterTime;
    const days = Math.floor(range / 86400000);
    const hours = Math.floor((range % 86400000) / 3600000);
    const minutes = Math.floor((range % 3600000) / 60000);
    let price;
    if (type === 'car') {
      price = days * 80000 + hours * 5000 + (minutes >= 1 ? 5000 : 0);
    } else {
      price = days * 40000 + hours * 2000 + (minutes >= 1 ? 2000 : 0);
    }
    return price;
  }

  async addParkingData({
    type, enterTime, exitTime,
  }) {
    const price = this._calculatePrice(type, enterTime, exitTime);
    const query = {
      text: 'INSERT INTO parking(type, enter_time, exit_time, price) VALUES($1, $2, $3, $4) RETURNING id',
      values: [type, enterTime, exitTime, price],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Insertion of parking data failed');
    }
  }

  async getParkingData({ type, timeRange, priceRange }) {
    const query = {
      text: 'SELECT * FROM parking WHERE TRUE',
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
        textToAppend += ` AND enter_time >= $${index}`;
        valuesToPush.push(timeRange.start);
        index += 1;
      }
      if (timeRange.end) {
        textToAppend += ` AND exit_time <= $${index}`;
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
