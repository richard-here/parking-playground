const { assert } = require('chai');
const InvariantError = require('../src/exceptions/InvariantError');
const ParkingValidator = require('../src/validator/parking');

describe('Parking validator', () => {
  it('should invalidate post payload without type', () => {
    try {
      ParkingValidator.validatePostParkingPayload({});
    } catch (e) {
      assert.isTrue(e instanceof InvariantError);
    }
  });
  it('should invalidate post payload with invalid type', () => {
    try {
      ParkingValidator.validatePostParkingPayload({ type: 'motor' });
    } catch (e) {
      assert.isTrue(e instanceof InvariantError);
    }
  });
  it('should invalidate post payload without enterTime', () => {
    try {
      ParkingValidator.validatePostParkingPayload({ type: 'car' });
    } catch (e) {
      assert.isTrue(e instanceof InvariantError);
    }
  });
  it('should invalidate post payload without exitTime', () => {
    try {
      ParkingValidator.validatePostParkingPayload({ type: 'motorcycle', enterTime: 1672941905000 });
    } catch (e) {
      assert.isTrue(e instanceof InvariantError);
    }
  });
  it('should invalidate post payload with exitTime smaller or equal to enterTime', () => {
    try {
      ParkingValidator.validatePostParkingPayload({ type: 'motorcycle', enterTime: 1672941905000, exitTime: 1672941905000 });
    } catch (e) {
      assert.isTrue(e instanceof InvariantError);
    }
  });
  it('should validate good post payload', async () => {
    try {
      const validationResult = ParkingValidator.validatePostParkingPayload({ type: 'car', enterTime: 1672941905000, exitTime: 1682941904000 });
      assert.notProperty(validationResult, 'error');
    } catch (e) {
      console.error(e);
    }
  });
});
