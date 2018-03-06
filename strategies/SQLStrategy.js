const Knex = require('knex');

const defaultConfig = {
  dialect: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './db.sqlite3',
  },
};

module.exports = class SQLStrategy {
  constructor(config = defaultConfig) {
    this.dbConfig = config;
    this.knex = Knex(config);
  }

  initialize() {
    return this.knex.schema
      .createTableIfNotExists('shops', table => {
        table.increments('id');
        table.string('shopify_domain');
        table.string('access_token');
        table.unique('shopify_domain');
      })
      .catch(error => {
        console.log(error);
      });
  }

  storeShop({ shop, accessToken, data = {} }, done) {
    const baseQuery = `INTO shops (shopify_domain, access_token) VALUES ('${shop}', '${accessToken}')`;
    const dbQuery = (this.dbConfig.hasOwnProperty('client') && this.dbConfig.client === 'pg')? 
    `INSERT ${baseQuery} ON CONFLICT (shopify_domain) DO NOTHING` : `INSERT OR IGNORE ${baseQuery}`;
    
    this.knex
      .raw(dbQuery)
      .then(result => {
        return done(null, accessToken);
      });
  }

  getShop({ shop }, done) {
    this.knex('shops')
      .where('shopify_domain', shop)
      .then(result => {
        return done(null, result);
      });
  }
};
