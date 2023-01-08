const InvariantError = require('../../exceptions/InvariantError');
const {
  GetParkingPayloadSchema,
  PostParkingPayloadSchema,
} = require('./schema');

const ParkingValidator = {
  validatePostParkingPayload: (payload) => {
    const validationResult = PostParkingPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateGetParkingPayload: (payload) => {
    const validationResult = GetParkingPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ParkingValidator;
