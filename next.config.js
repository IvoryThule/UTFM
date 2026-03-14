/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	reactStrictMode: true,
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.alicdn.com",
			},
			{
				protocol: "https",
				hostname: "store.is.autonavi.com",
			},
			{
				protocol: "https",
				hostname: "aos-cdn-image.amap.com",
			},
			{
				protocol: "https",
				hostname: "aos-comment.amap.com",
			},
			{
				protocol: "http",
				hostname: "store.is.autonavi.com",
			},
		],
	},
};

module.exports = nextConfig;
