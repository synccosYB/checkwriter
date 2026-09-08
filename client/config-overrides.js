// This fil over rides webpack config file.
// You can see this blog why this is done here for all the details

// Go to this link: https://alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5

const webpack = require('webpack')
module.exports = function override(config) {
	const fallback = config.resolve.fallback || {}
	Object.assign(fallback, {
		util: require.resolve('util'),
		stream: require.resolve('stream-browserify'),
		crypto: require.resolve('crypto-browserify'),
		buffer: require.resolve('buffer'),
		path: require.resolve('path-browserify'),
		process: require.resolve('process/browser')
	})
	config.resolve.fallback = fallback
	config.plugins = (config.plugins || []).concat([
		new webpack.ProvidePlugin({
			process: 'process',
			Buffer: ['buffer', 'Buffer']
		})
	])
	return config
}
