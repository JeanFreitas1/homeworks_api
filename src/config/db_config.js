module.exports = {
  development: {
    url: 'postgres://postgres:postgres@localhost:5434/postgres',
    dialect: 'postgres',
    dialectOptions: {},
  },
  test: {
    url: 'postgres://postgres:postgres@localhost:5435/postgres',
    dialect: 'postgres',
    dialectOptions: {},
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
