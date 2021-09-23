let options = {
  app_name: process.env.APP_NAME || "TEST",
  base_url:
    process.env.APP_URL + ":" + process.env.APP_PORT || "http://localhost:8000",
  app_maintinance_mode: process.env.APP_MAINTINANCE_MODE || false,
  debug: process.env.DEBUG || false,
  environment: process.env.ENVIRONMENT || "production",
  databases: {
    default: {
      provider: "mongodb",
      url: process.env.MONGO_DB,
    },

    mysql: {
      provider: "mysql",
      db_host: process.env.MYSQL_HOST || "localhost",
      db_name: process.env.MYSQL_DB || process.env.APP_NAME,
      db_username: process.env.MYSQL_USERNAME || "root",
      db_password: process.env.MYSQL_PASSWORD || "",
    },
  },

  smtp: {
    default: {
      mailer: process.env.MAIL_MAILER,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      username: process.env.MAIL_USERNAME,
      password: process.env.MAIL_PASSWORD,
      encryption: process.env.MAIL_ENCRYPTION,
      fromEmail: process.env.MAIL_FROM_ADDRESS,
      fromName: process.env.MAIL_FROM_NAME,
    },
    gmail: {},
  },
  credintals: {
    jwt_secret_key: process.env.JWT_SECRET_KEY || "some relevant key ",
  },
  token_expiry_time: 60, //in munites approx
};

module.exports = options;
