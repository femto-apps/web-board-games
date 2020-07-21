const path = require('path')
const webpack = require('webpack')

module.exports = {
    mode: 'development',
    entry: './src/manageGames.js',
    output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: 'manageGames.bundle.js'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ]
}