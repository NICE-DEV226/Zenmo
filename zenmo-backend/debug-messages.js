const mongoose = require('mongoose');

const uri = 'mongodb+srv://NICEDEV77:eeUDaYF43BW26AG@cluster0.e2ur4fn.mongodb.net/zenmo?retryWrites=true&w=majority&appName=Cluster0';

async function debugSpecificConversation() {
    try {
        await mongoose.connect(uri);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;

        // Get the latest conversation
        const conversations = await db.collection('conversations').find({}).sort({ _id: -1 }).limit(1).toArray();
        if (conversations.length === 0) {
            console.log('No conversations found');
            process.exit(0);
        }

        const conv = conversations[0];
        console.log('Latest Conversation:');
        console.log('  _id:', conv._id);
        console.log('  _id type:', typeof conv._id);
        console.log('  _id toString():', conv._id.toString());

        // Try to find messages with this conversation ID
        console.log('\n🔍 Searching messages with conversationId =', conv._id.toString());
        const messages1 = await db.collection('messages').find({ conversationId: conv._id.toString() }).toArray();
        console.log('  Found (string):', messages1.length);

        console.log('\n🔍 Searching messages with conversationId = ObjectId');
        const messages2 = await db.collection('messages').find({ conversationId: conv._id }).toArray();
        console.log('  Found (ObjectId):', messages2.length);

        // Show all messages for debugging
        const allMessages = await db.collection('messages').find({}).sort({ _id: -1 }).limit(3).toArray();
        console.log('\n📨 Latest 3 messages:');
        allMessages.forEach((msg, i) => {
            console.log(`\n  Message ${i + 1}:`);
            console.log('    conversationId:', msg.conversationId);
            console.log('    conversationId type:', typeof msg.conversationId);
            console.log('    content:', msg.content.substring(0, 50));
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugSpecificConversation();
