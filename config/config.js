module.exports = {
    database: process.env.DATABASE_URL,
    JWTSecret: process.env.JWT_SECRET,
    port: process.env.PORT,
    userAgent: process.env.USER_AGENT,
    accessToken: process.env.GITHUB_ACCESS_TOKEN,
    weatherAPIkey: process.env.WEATHER_API_ACCESS_TOKEN,
};
