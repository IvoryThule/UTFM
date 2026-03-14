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
    // standalone server.js 使用自身 __dirname 解析 .next/ 路径，
    // 因此必须以 standalone 目录为 cwd 运行
    script: 'server.js',
    cwd: path.join(__dirname, '.next/standalone'),
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      ...env,
      NODE_ENV: 'production',
      PORT: PORT,
      HOSTNAME: '0.0.0.0',
      DATABASE_URL: `file:${__dirname}/db_data/prod.db`,
    }
  }]
};
