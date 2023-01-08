exports.up = (pgm) => {
  pgm.createTable('parking', {
    id: {
      type: 'SERIAL',
      primaryKey: true,
    },
    type: {
      type: 'VARCHAR(10)',
      notNull: true,
    },
    enter_time: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    exit_time: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    price: {
      type: 'BIGINT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('parking');
};
