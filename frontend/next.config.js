module.exports = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'static.nike.com',
                port: '',
                pathname: '/a/images/**',
            },
        ],
    },
}