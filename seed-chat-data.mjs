import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedChatData() {
  console.log('🌱 Seeding chat test data...');

  try {
    // Create test users
    const testUsers = [
      { id: 'user-1', email: 'alice@example.com', name: 'Alice Johnson' },
      { id: 'user-2', email: 'bob@example.com', name: 'Bob Smith' },
      { id: 'user-3', email: 'charlie@example.com', name: 'Charlie Brown' }
    ];

    // Create a conversation
    console.log('📝 Creating test conversation...');
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        id: 'test-conversation-1',
        title: 'Test Chat',
        type: 'direct',
        created_by: 'user-1',
        participants: ['user-1', 'user-2']
      })
      .select()
      .single();

    if (convError) {
      console.error('❌ Error creating conversation:', convError);
      return;
    }

    console.log('✅ Created conversation:', conversation.id);

    // Create test messages
    console.log('💬 Creating test messages...');
    const messages = [
      {
        conversation_id: conversation.id,
        sender_id: 'user-1',
        content: 'Hello! This is a test message.',
        message_type: 'text',
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        conversation_id: conversation.id,
        sender_id: 'user-2',
        content: 'Hi Alice! Thanks for the test message.',
        message_type: 'text',
        created_at: new Date(Date.now() - 1800000).toISOString() // 30 min ago
      },
      {
        conversation_id: conversation.id,
        sender_id: 'user-1',
        content: 'The chat system is working perfectly! 🎉',
        message_type: 'text',
        created_at: new Date().toISOString()
      }
    ];

    const { data: insertedMessages, error: msgError } = await supabase
      .from('messages')
      .insert(messages)
      .select();

    if (msgError) {
      console.error('❌ Error creating messages:', msgError);
      return;
    }

    console.log(`✅ Created ${insertedMessages.length} test messages`);

    // Create another conversation for group chat
    console.log('👥 Creating group conversation...');
    const { data: groupConv, error: groupError } = await supabase
      .from('conversations')
      .insert({
        id: 'test-conversation-2',
        title: 'Group Chat',
        type: 'group',
        created_by: 'user-1',
        participants: ['user-1', 'user-2', 'user-3']
      })
      .select()
      .single();

    if (groupError) {
      console.error('❌ Error creating group conversation:', groupError);
      return;
    }

    console.log('✅ Created group conversation:', groupConv.id);

    // Add a message to the group chat
    const { error: groupMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: groupConv.id,
        sender_id: 'user-3',
        content: 'Welcome to the group chat everyone!',
        message_type: 'text'
      });

    if (groupMsgError) {
      console.error('❌ Error creating group message:', groupMsgError);
    } else {
      console.log('✅ Created group message');
    }

    console.log('🎉 Chat test data seeded successfully!');
    console.log('\n📋 Test Data Summary:');
    console.log('- Direct conversation: test-conversation-1 (Alice ↔ Bob)');
    console.log('- Group conversation: test-conversation-2 (Alice, Bob, Charlie)');
    console.log('- Total messages: 4');

  } catch (error) {
    console.error('❌ Error seeding chat data:', error);
  }
}

seedChatData().catch(console.error);
