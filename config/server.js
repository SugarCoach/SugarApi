module.exports = ({ env }) => ({
  host: env('HOST', '3.83.111.70'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', ["SeqstsKofIWNsUPrK95ZQQ==","iP+MLK9dZ8hEd8blPRFENw==","rcm1NFt7RIlQfzDVpGWwmw==","UDhz02ffQSnrLKGARZLQ5g=="]),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
