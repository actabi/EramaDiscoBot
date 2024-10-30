module.exports = {
    apps: [{
      name: 'discord-bot',
      script: './src/main.js',
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      restart_delay: 4000,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
      max_cpu_percent: 90,
    }],
  };
  