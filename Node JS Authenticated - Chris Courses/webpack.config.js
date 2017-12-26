const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require('webpack');
const path = require('path');

// Create multiple instances 
const styles = new ExtractTextPlugin('../css/[name].styles.css');

module.exports = {
	entry: {
		home: path.join(__dirname, '/src/js/home.js')
	},
	output: {
		path: path.join(__dirname, 'public/js'),
		filename: '[name].bundle.js',
		publicPath: path.join(__dirname, '/public/js')
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: 'css-loader',
				})
			},
			{
				test: /\.js$/,
				exclude: /node_modules|bower_components/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['es2015']
					}
				}

			}
		]
	},
	watch: true,
	plugins: [
		styles,
		new webpack.HotModuleReplacementPlugin(),
	],
	devServer: {
		hot: true,
		contentBase: path.join(__dirname, 'views')
	}
};
