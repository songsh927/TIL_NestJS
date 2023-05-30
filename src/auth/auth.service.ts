import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import authConfig from "src/config/authConfig";
import { ConfigType } from "@nestjs/config";
import * as jwt from 'jsonwebtoken';

interface User {
    id: string;
    name: string;
    email: string;
}

@Injectable()
export class AuthService{
    constructor(
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    ){}

    async login(user: User){
        const payload = {...user};

        const _token =  jwt.sign(payload, this.config.jwtSecret, {
            expiresIn: '1d',
            audience: 'example.com',
            issuer: 'example.com'
        });

        return _token;
    }

    async verify(jwtString: string){
        try {
            const payload = jwt.verify(jwtString, this.config.jwtSecret) as (jwt.JwtPayload | string) & User;

            const {id, email} = payload;

            return {
                userId: id,
                email
            };
        } catch (e) {
            throw new UnauthorizedException();
        }
    }
}