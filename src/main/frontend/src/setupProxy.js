const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    const proxyConfig = {
        target: 'http://localhost:8080',
        changeOrigin: true,
    };

    app.use('/api', createProxyMiddleware(proxyConfig));
    app.use('/products', createProxyMiddleware(proxyConfig));
    app.use('/inquiries', createProxyMiddleware(proxyConfig));
    app.use('/login', createProxyMiddleware(proxyConfig));
    app.use('/logout', createProxyMiddleware(proxyConfig));
};