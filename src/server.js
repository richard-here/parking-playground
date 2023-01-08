require('dotenv').config();

const Hapi = require('@hapi/hapi');

// Parking
const parking = require('./api/parking');
const ParkingValidator = require('./validator/parking');
const ParkingService = require('./services/postgres/ParkingService');

// Exceptions
const InvariantError = require('./exceptions/InvariantError');
const NotFoundError = require('./exceptions/NotFoundError');

const init = async () => {
  const parkingService = new ParkingService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: parking,
      options: {
        service: parkingService,
        validator: ParkingValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof InvariantError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message ? response.message : 'Bad request',
        });
        newResponse.code(400);
        return newResponse;
      }
      if (response instanceof NotFoundError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message ? response.message : 'Not found',
        });
        newResponse.code(404);
        return newResponse;
      }
      const newResponse = h.response({
        status: 'fail',
        message: response.message ? response.message : 'Server error',
      });
      newResponse.code(response.output.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server is running at ${server.info.uri}`);
};

init();
