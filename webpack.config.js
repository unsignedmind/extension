const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: false,
    entry: {
        background:    './src/background.js',
        contentScript: './src/contentScript.js',
        // this key “popup/popup” becomes dist/popup/popup.js
        'popup/popup': './src/popup/popup.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                // copy manifest.json from src → dist
                { from: 'src/manifest.json', to: 'manifest.json' },
                // copy icons directory
                { from: 'src/icons',         to: 'icons'        },
                // copy overlay.css
                { from: 'src/overlay.css',   to: 'overlay.css'  },
                // copy popup HTML & CSS (JS is bundled above)
                { from: 'src/popup/popup.html', to: 'popup/popup.html' },
                { from: 'src/popup/popup.css',  to: 'popup/popup.css'  },
            ],
        }),
    ],
    module: {
        rules: [
            // add loaders here if you import other asset types
        ],
    },
    optimization: {
        minimize: true,
    },
};
