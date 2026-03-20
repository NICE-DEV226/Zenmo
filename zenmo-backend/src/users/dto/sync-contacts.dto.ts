import { IsArray, IsString, ArrayNotEmpty, Matches } from 'class-validator';

export class SyncContactsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @Matches(/^[a-f0-9]{64}$/, {
        each: true,
        message: 'Each contact must be a valid SHA-256 hash'
    })
    hashes: string[];
}
