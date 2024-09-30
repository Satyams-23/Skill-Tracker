const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        background: './src/background/index.js',
        content: './src/content/index.js',
        popup: './src/popup/index.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'public', to: '.' },  // This will copy everything from public, including the icons
                { from: 'src/popup/index.html', to: 'popup.html' },
                { from: 'src/popup/style.css', to: 'style.css' },
            ],
        }),
    ],
};