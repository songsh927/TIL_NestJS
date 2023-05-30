import { registerAs } from "@nestjs/config";

export default registerAs('email', () => ({
    service: process.env.EMAIL_SERVICE,
    auth:{
        type:"OAuth2",
        user: process.env.EMAIL_AUTH_USER,
        clientId: process.env.EMAIL_AUTH_CLIENTID,
        clientSecret: process.env.EMAIL_AUTH_CLIENTSECRET,
        refreshToken: process.env.EMAIL_REFRESH_TOKEN
    },
    baseUrl: process.env.EMAIL_BASE_URL
}));