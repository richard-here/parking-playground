const Joi = require('joi');

const PostParkingPayloadSchema = Joi.object({
  type: Joi.string().insensitive().valid('car', 'motorcycle').required(),
  enterTime: Joi.date().timestamp().required(),
  exitTime: Joi.date().timestamp().greater(Joi.ref('enterTime')).required(),
});

const GetParkingPayloadSchema = Joi.object({
  type: Joi.string().insensitive().valid('car', 'motorcycle').optional(),
  enterTime: Joi.date().timestamp().optional(),
  exitTime: Joi.date().timestamp().when('enterTime', {
    is: Joi.date().timestamp(),
    then: Joi.date().timestamp().greater(Joi.ref('enterTime')),
    otherwise: Joi.date().timestamp(),
  }).optional(),
  priceMin: Joi.number().optional(),
  priceMax: Joi.number().when('priceMin', {
    is: Joi.number(),
    then: Joi.number().min(Joi.ref('priceMin')),
    otherwise: Joi.number(),
  }).optional(),
});

module.exports = {
  PostParkingPayloadSchema,
  GetParkingPayloadSchema,
};
