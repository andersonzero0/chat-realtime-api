module.exports = {
  apps: [
    {
      name: 'chat-api',
      script: './dist/main.js',
      instances: 2,
      watch: false,
      increment_var: 'PORT',
      exec_mode: 'fork',
      env: {
        PORT: 3000,
      },
    },
  ],
};
