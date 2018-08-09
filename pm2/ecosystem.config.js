const path = require('path');

const __root = path.join(__dirname, '../');

module.exports = {
    apps: [{
        name: 'file-parser',
        cwd: __root,
        script: './src/server.js',
        interpreter: `${__root}/node_modules/.bin/babel-node`,
        ignore_watch: ['.git/*', 'node_modules/*', './tmp/*'],
        node_args: [
            '--max-old-space-size=1024'
        ],
        watch: true,
        env: {
            NODE_ENV: 'development',
            PORT: 8005
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 8005
        }
    }]
};
