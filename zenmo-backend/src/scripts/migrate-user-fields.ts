import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

/**
 * Script de migration pour ajouter les nouveaux champs aux utilisateurs existants
 * Exécuter avec: npm run migration:user-fields
 */
async function migrateUserFields() {
    console.log('🔄 Starting user fields migration...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const userModel = app.get<Model<UserDocument>>('UserModel');
    
    try {
        // Mettre à jour tous les utilisateurs qui n'ont pas les nouveaux champs
        const result = await userModel.updateMany(
            {
                $or: [
                    { bio: { $exists: false } },
                    { gender: { $exists: false } },
                    { interests: { $exists: false } }
                ]
            },
            {
                $set: {
                    bio: '',
                    interests: []
                }
                // Note: gender reste undefined car c'est optionnel
            }
        );
        
        console.log(`✅ Migration completed! Updated ${result.modifiedCount} users`);
        
        // Afficher quelques utilisateurs mis à jour
        const updatedUsers = await userModel.find({}).select('username bio interests gender').limit(5);
        console.log('📋 Sample updated users:');
        updatedUsers.forEach(user => {
            console.log(`- ${user.username}: bio="${user.bio}", interests=[${user.interests?.join(', ')}], gender=${user.gender || 'undefined'}`);
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await app.close();
    }
}

// Exécuter la migration si ce fichier est appelé directement
if (require.main === module) {
    migrateUserFields().catch(console.error);
}

export { migrateUserFields };