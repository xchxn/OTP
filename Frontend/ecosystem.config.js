module.exports = {
  apps: [{
    name: "angular-app",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
}