/* eslint-disable camelcase */
const mapParkingDBToModel = ({
  id,
  type,
  enter_time,
  exit_time,
  price,
}) => ({
  id,
  type,
  enterTime: parseInt(enter_time, 10),
  exitTime: parseInt(exit_time, 10),
  price,
});

module.exports = mapParkingDBToModel;
