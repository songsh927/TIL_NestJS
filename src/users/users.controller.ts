import { Body, Controller, Get, Headers, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { VerifyEmailDTO } from './dto/verify-email.dto';
import { UserLoginDTO } from './dto/user-login.dto';
import { AuthService } from 'src/auth/auth.service';
import { UserInfo } from './userInfo';
import { AuthGuard } from 'src/auth.guard';
import { Logger as WinstonLogger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Controller('users')
export class UsersController {
    constructor(
        private userService: UsersService,
        private authService: AuthService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger : WinstonLogger
    ){}

    @Get('/hello')
    async hello(){
        return 'hello';
    }

    @Post('/join')
    async join(@Body() createUser: CreateUserDTO): Promise<any>{
        const ret = {
            success: true,
            data: null,
            message: null
        };

        const {name, email, password} = createUser;
        const res = await this.userService.createUser(name, email, password);

        return res;
    }

    @Post('/email-verify')
    async verifyEmail(@Query() dto: VerifyEmailDTO): Promise<string>{
        const {signupVerifyToken} = dto;

        return await this.userService.verifyEmail(signupVerifyToken);
    }

    @Post('/login')
    async login(@Body() dto: UserLoginDTO): Promise<string>{
        const {email, password} = dto;

        return await this.userService.login(email, password);
    }

    @UseGuards(AuthGuard)
    @Get('/:id')
    async getUserInfo(@Headers() headers: any, @Param('id') userId: string): Promise<UserInfo>{
    // async getUserInfo(@Headers() headers: any): Promise<UserInfo>{
        // const jwtString = headers.authorization.split('Bearer ')[1];
        // const userInfo = await this.authService.verify(jwtString);
        // return await this.userService.getUserInfo(userInfo.userId);

        return await this.userService.getUserInfo(userId);
        
    }

    @Post('/loggertest')
    async createUser(@Body() dto: CreateUserDTO): Promise<void> {
        this.printWinstonLog(dto);
    }

    private printWinstonLog(dto) {

        this.logger.error('error: ', dto);
        this.logger.warn('warn: ', dto);
        this.logger.info('info: ', dto);
        this.logger.http('http: ', dto);
        this.logger.verbose('verbose: ', dto);
        this.logger.debug('debug: ', dto);
        this.logger.silly('silly: ', dto);
    }
}
