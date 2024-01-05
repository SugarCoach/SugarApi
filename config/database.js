module.exports = ({ env }) => ({
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
});
