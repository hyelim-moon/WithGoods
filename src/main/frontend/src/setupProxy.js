const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    console.log('Setting up proxy middleware');
    
    const proxyConfig = {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
        xfwd: true,
        onProxyReq: function(proxyReq, req, res) {
            console.log('Proxying request:', req.method, req.url, '→', proxyConfig.target + req.url);
        },
        onError: function(err, req, res) {
            console.error('Proxy error:', err);
        }
    };

    app.use('/api', createProxyMiddleware(proxyConfig));
};