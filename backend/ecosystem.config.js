module.exports = {
  apps : [{
    name: "backend",
    script: "./dist/main.js",
    env_production: {
      NODE_ENV: "production",
      PORT: 5000
    },
    watch: false,
    max_memory_restart: "1G",
  }]
}
