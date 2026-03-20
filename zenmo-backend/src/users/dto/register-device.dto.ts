import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class RegisterDeviceDto {
    @IsNotEmpty()
    @IsString()
    oneSignalPlayerId: string;

    @IsNotEmpty()
    @IsEnum(['ios', 'android'])
    platform: 'ios' | 'android';

    @IsOptional()
    @IsString()
    deviceModel?: string;

    @IsOptional()
    @IsString()
    appVersion?: string;
}
