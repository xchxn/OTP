module.exports = {
  apps: [{
    name: "angular-app",
    script: "npm",
    args: "run start:prod",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 4200
    }
  }]
}