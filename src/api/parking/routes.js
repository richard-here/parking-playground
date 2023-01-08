const routes = (handler) => [
  {
    method: 'POST',
    path: '/parking',
    handler: handler.postParkingHandler,
  },
  {
    method: 'GET',
    path: '/parking',
    handler: handler.getParkingHandler,
  },
];

module.exports = routes;
