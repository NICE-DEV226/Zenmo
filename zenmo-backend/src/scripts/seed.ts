import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { VibesService } from '../vibes/vibes.service';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import * as argon2 from 'argon2';

async function bootstrap() {
    console.log('🌱 Starting Database Seed...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const vibesService = app.get(VibesService);

    // 1. Create Test Users
    const users = [
        {
            username: 'sarah_bf',
            displayName: 'Sarah Kaboré',
            email: 'sarah@zenmo.bf',
            password: 'password123',
            phoneNumber: '+22600000001',
            city: 'Ouagadougou',
            countryCode: 'BF',
            avatarUrl: 'https://i.pravatar.cc/150?u=sarah_bf',
            bio: 'Amoureuse de Ouaga 🇧🇫 | Tech & Culture',
        },
        {
            username: 'marc_tech',
            displayName: 'Marc Ouédraogo',
            email: 'marc@zenmo.bf',
            password: 'password123',
            phoneNumber: '+22600000002',
            city: 'Ouagadougou',
            countryCode: 'BF',
            avatarUrl: 'https://i.pravatar.cc/150?u=marc_tech',
            bio: 'Développeur Fullstack 💻 | Gamer 🎮',
        },
        {
            username: 'lea_mode',
            displayName: 'Léa Sawadogo',
            email: 'lea@zenmo.bf',
            password: 'password123',
            phoneNumber: '+22600000003',
            city: 'Bobo-Dioulasso',
            countryCode: 'BF',
            avatarUrl: 'https://i.pravatar.cc/150?u=lea_mode',
            bio: 'Fashion Designer 👗 | Bobo Life',
        },
    ];

    const createdUsers: UserDocument[] = [];

    for (const user of users) {
        try {
            let existingUser = await usersService.findByUsername(user.username);

            if (!existingUser) {
                console.log(`Creating user: ${user.username}`);

                const hashedPassword = await argon2.hash(user.password);

                const newUser = await usersService.create({
                    ...user,
                    password: hashedPassword,
                });
                createdUsers.push(newUser);
                console.log(`✅ User ${user.username} created.`);
            } else {
                console.log(`User ${user.username} already exists.`);
                createdUsers.push(existingUser);
            }

        } catch (error) {
            console.error(`Failed to create user ${user.username}:`, error.message);
        }
    }

    // 2. Create Vibes for these users
    console.log('Creating Vibes...');

    const vibesData = [
        {
            username: 'sarah_bf',
            vibes: [
                { text: 'Première journée à Ouaga 🌞 Cette ville est incroyable !', type: 'mood' },
                { text: 'Qui est chaud pour un café demain ? ☕', type: 'question' }
            ]
        },
        {
            username: 'marc_tech',
            vibes: [
                { text: 'Quelqu\'un connaît un bon resto à Ouaga 2000 ? 🍽️', type: 'question' },
                { text: 'Coding night ! 💻🌙 #DevLife', type: 'mood' }
            ]
        },
        {
            username: 'lea_mode',
            vibes: [
                { text: 'Le coucher de soleil sur le lac 🌅 C\'est magique ✨', type: 'mood' },
                { text: 'Nouvelle collection bientôt dispo ! 👗', type: 'confession' }
            ]
        }
    ];

    for (const data of vibesData) {
        const user = createdUsers.find(u => u.username === data.username);
        if (user) {
            for (const vibeData of data.vibes) {
                try {
                    await vibesService.create(user._id.toString(), {
                        text: vibeData.text,
                        type: vibeData.type as any,
                        city: user.city,
                        countryCode: user.countryCode
                    });
                    console.log(`✅ Vibe created for ${user.username}`);
                } catch (error) {
                    console.error(`Failed to create vibe for ${user.username}:`, error.message);
                }
            }
        }
    }

    await app.close();
    console.log('🌱 Seed completed!');
}

bootstrap();
