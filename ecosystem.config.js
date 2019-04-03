module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name:   "micavibe",
      script: "server.js",
      watch: true,
      env: {
        PORT: "8083",
        WS_URL: "ws://localhost:8083/streaming",
        NODE_ENV: "development",
        NCONF_FILE: ".nconf.json"
      },
      env_production : {
        NODE_ENV: "production",
        PORT: "8080",
        WS_URL: "wss://micavibe.com/streaming"
      }
    },
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : "micaweb",
      host : "micavibe.com",
      ref  : "origin/master",
      repo : "git@github.com:micais2019/micavibe.com.git",
      path : "/var/www/app",
      "post-deploy" : "ln -fs /var/www/app/shared/.nconf.json /var/www/app/current/ && npm install && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
}
