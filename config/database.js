/*module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST", "sugar-db.cmoghtwgghmz.us-east-1.rds.amazonaws.com"),
      port: env.int("DATABASE_PORT", 5432),
      database: env("DATABASE_NAME", "sugarDb"),
      user: env("DATABASE_USERNAME", "sugarDb"),
      password: env("DATABASE_PASSWORD", "Sugarcoach2023!"),
    },
    ssl:{
      rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false)
    },
    useNullAsDefault: true,
    options:{
      ssl: env.bool('DATABASE_SSL', true),
    },
  },
}); */

/*module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST", "viaduct.proxy.rlwy.net"),
      port: env.int("DATABASE_PORT", 15885),
      database: env("DATABASE_NAME", "railway"),
      user: env("DATABASE_USERNAME", "postgres"),
      password: env("DATABASE_PASSWORD" ,"4d1e6B*eEf6dgA5CG-dgDega51c1E3F5"),
    },
    ssl:{
      rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false)
    },
    useNullAsDefault: true,
    options:{
      ssl: env.bool('DATABASE_SSL', true),
    },
  },
});*/

module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST"),
      port: env.int("DATABASE_PORT"),
      database: env("DATABASE_NAME"),
      user: env("DATABASE_USERNAME"),
      password: env("DATABASE_PASSWORD"),
    },
    ssl:{
      rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false)
    },
    useNullAsDefault: true,
    options:{
      ssl: env.bool('DATABASE_SSL', true),
    },
  },
}); 