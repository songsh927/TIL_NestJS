import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import emailConfig from './config/emailConfig';
import { validationSchema } from './config/validationSchema';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './middleware/logger.middleware';
import authConfig from './config/authConfig';
import * as winston from 'winston';
import {
    utilities as nestWinstonModuleUtilities,
    WinstonModule,
} from 'nest-winston';
import { ExceptionModule } from './exception/exception.module';

@Module({
    imports: [
        // User Service Module
        UsersModule,

        // ENV
        ConfigModule.forRoot({
        // envFilePath:[`${__dirname}/config/env/.${process.env.NODE_ENV}.env`],
        envFilePath:[`${__dirname}/config/env/.env`],
        load: [emailConfig, authConfig],
        isGlobal: true,
        validationSchema
        }),

        // DB connection
        TypeOrmModule.forRoot({
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: 3306,
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'nest_test',
        entities: [__dirname + `/**/*.entity{.ts,.js}`],
        synchronize: true
        }),

        // Logging
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({
                    level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        nestWinstonModuleUtilities.format.nestLike('MyApp', {prettyPrint: true}),
                    )
                })
            ]
        }),

        // 예외처리
        ExceptionModule
    ],
    controllers: [],
    providers: [],
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer
        .apply(LoggerMiddleware)
        .forRoutes('/users');
    }
}
