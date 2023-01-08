const ParkingHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'parking',
  version: '1.0.0',
  register: async (server, {
    service, validator,
  }) => {
    const parkingHandler = new ParkingHandler(service, validator);
    server.route(routes(parkingHandler));
  },
};
