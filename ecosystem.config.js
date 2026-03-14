const fs = require('fs');
const path = require('path');

// 动态读取 .env，每次 pm2 reload 都获取最新值
function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  return fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .reduce((acc, line) => {
      const match = line.match(/^([^#\s][^=]*)=(.*)/);
      if (match) {
        acc[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
      return acc;
    }, {});
}

const env = loadEnv(path.join(__dirname, '.env'));
const PORT = env.APP_PORT || '3000';

module.exports = {
  apps: [{
    name: 'university-food-map',
    script: 'current/server.js',
    cwd: __dirname,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      ...env,
      NODE_ENV: 'production',
      PORT: PORT,
      HOSTNAME: '0.0.0.0',
      // 数据库固定放在 db_data/，重新部署不丢失
      DATABASE_URL: `file:${__dirname}/db_data/prod.db`,
    }
  }]
};
