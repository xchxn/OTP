module.exports = {
  apps: [
    {
      name: 'otc-frontend',
      script: 'npm',
      args: 'run start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  // 배포 설정
  // deploy: {
  //   production: {
  //     user: 'user',
  //     host: ['your-production-host'],
  //     ref: 'origin/main',
  //     repo: 'your-repository-url',
  //     path: '/var/www/otc-frontend',
  //     'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
  //   }
  // }
};
