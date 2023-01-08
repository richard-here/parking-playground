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
  enterTime: enter_time,
  exitTime: exit_time,
  price,
});

module.exports = mapParkingDBToModel;
