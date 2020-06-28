module.exports = {
  development: {
    client: "mysql",
    connection: {
      host: "127.0.0.1",
      user: "root",
      password: "661996",
      database: "laby",
      debug: false,
    },
    pool: {
      min: 2,
      max: 3,
    },
    migrations: {
      tableName: "knex_migrations",
    }
  },
  production: {
    client: "mysql",
    connection: {
      host: "127.0.0.1",
      user: "root",
      password: "password",
      database: "my_app",
    },
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      tableName: "knex_migrations",
    }
  }
};
