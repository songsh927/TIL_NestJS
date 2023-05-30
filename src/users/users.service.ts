import * as uuid from 'uuid';
import { ulid } from 'ulid';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from './userInfo';

@Injectable()
export class UsersService {
    constructor(
        private emailService: EmailService,
        private dataSource: DataSource,
        private authService: AuthService,
        @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>
        ){}

    async createUser(name: string, email: string, password: string){    
        const checkUserExist = await this.checkUserExists(email);
        if(checkUserExist){
            throw new UnprocessableEntityException('해당 이메일로는 가입할 수 없습니다');
        }

        const signupVerifyToken = uuid.v1();

        await this.saveUser(name, email, password, signupVerifyToken);
        await this.sendMemberJoinEmail(email, signupVerifyToken);
    }

    private async checkUserExists(email: string){
        const user = await this.usersRepository.findOne({
            where: { email: email}
        });

        return user !== undefined;
    }

    private async saveUser(name: string, email: string, password: string, signupVerifyToken: string){
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = new UserEntity();
            user.id = ulid();
            user.name = name;
            user.email = email;
            user.password = password;
            user.signupVerifyToken = signupVerifyToken;

            await this.usersRepository.save(user);

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }

    }

    private async sendMemberJoinEmail(email: string, signupVerifyToken: string){
        await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
    }


    async verifyEmail(signupVerifyToken: string): Promise<string>{
        const user = await this.usersRepository.findOne({
            where :{ signupVerifyToken }
        });

        if(!user){
            throw new NotFoundException('유저가 존재하지 않습니다.');
        }

        return this.authService.login({
            id: user.id,
            name: user.name,
            email: user.email
        })
    }

    async login(email: string, password: string):Promise<string>{
        const user = await this.usersRepository.findOne({
            where :{ email, password}
        });

        if(!user){
            throw new NotFoundException('유저가 존재하지 않습니다.')
        }

        return this.authService.login({
            id: user.id,
            name: user.name,
            email: user.email
        })
    }

    async getUserInfo(id: string): Promise<UserInfo>{

        const user = await this.usersRepository.findOne({
            where: {id}
        });

        if(!user){
            throw new NotFoundException('유저가 존재하지 않습니다.');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email
        };
    }
}
