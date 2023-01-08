const Joi = require('joi');

const PostParkingPayloadSchema = Joi.object({
  type: Joi.string().valid('car', 'motorcycle').required(),
  enterTime: Joi.date.timestamp().required(),
  exitTime: Joi.date.timestamp().required(),
});

// Need to validate enterTime exitTime priceMin priceMax
const GetParkingPayloadSchema = Joi.object({
  type: Joi.string().valid('car', 'motorcycle').optional(),
  enterTime: Joi.date.timestamp().optional(),
  exitTime: Joi.date.timestamp().optional(),
  priceMin: Joi.number.optional(),
  priceMax: Joi.number.optional(),
});

module.exports = {
  PostParkingPayloadSchema,
  GetParkingPayloadSchema,
};
