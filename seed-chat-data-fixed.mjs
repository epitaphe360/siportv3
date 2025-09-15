import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingUsers() {
  console.log('🔍 Checking existing users...');

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }

    console.log(`✅ Found ${users.length} existing users:`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}): ${user.id}`);
    });

    return users;
  } catch (error) {
    console.error('❌ Error checking users:', error);
    return [];
  }
}

async function createTestUsers() {
  console.log('👤 Creating test users...');

  const testUsers = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      type: 'visitor'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'bob@example.com',
      name: 'Bob Smith',
      type: 'exhibitor'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'charlie@example.com',
      name: 'Charlie Brown',
      type: 'visitor'
    }
  ];

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(testUsers, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('❌ Error creating test users:', error);
      return [];
    }

    console.log(`✅ Created/updated ${data.length} test users`);
    return data;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    return [];
  }
}

async function seedChatData() {
  console.log('🌱 Seeding chat test data...');

  // Check existing users first
  let users = await checkExistingUsers();

  // If no users exist, create test users
  if (users.length === 0) {
    console.log('📝 No existing users found, creating test users...');
    users = await createTestUsers();
  }

  if (users.length < 2) {
    console.error('❌ Need at least 2 users to create conversations');
    return;
  }

  try {
    // Create a conversation between first two users
    console.log('📝 Creating test conversation...');
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: 'direct',
        participants: [users[0].id, users[1].id],
        created_by: users[0].id
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
        sender_id: users[0].id,
        content: `Hello ${users[1].name}! This is a test message from the chat system.`,
        message_type: 'text'
      },
      {
        conversation_id: conversation.id,
        sender_id: users[1].id,
        content: `Hi ${users[0].name}! Thanks for the test message. The chat is working! 🎉`,
        message_type: 'text'
      },
      {
        conversation_id: conversation.id,
        sender_id: users[0].id,
        content: 'Great! You can now start chatting with other users on the platform.',
        message_type: 'text'
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

    // Create a group conversation if we have 3+ users
    if (users.length >= 3) {
      console.log('👥 Creating group conversation...');
      const { data: groupConv, error: groupError } = await supabase
        .from('conversations')
        .insert({
          type: 'group',
          title: 'Test Group Chat',
          participants: users.slice(0, 3).map(u => u.id),
          created_by: users[0].id
        })
        .select()
        .single();

      if (groupError) {
        console.error('❌ Error creating group conversation:', groupError);
      } else {
        console.log('✅ Created group conversation:', groupConv.id);

        // Add a welcome message
        const { error: groupMsgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: groupConv.id,
            sender_id: users[2].id,
            content: `Welcome to the group chat, ${users.map(u => u.name).join(', ')}! 👋`,
            message_type: 'text'
          });

        if (groupMsgError) {
          console.error('❌ Error creating group message:', groupMsgError);
        } else {
          console.log('✅ Created group welcome message');
        }
      }
    }

    console.log('\n🎉 Chat test data seeded successfully!');
    console.log('\n📋 Test Data Summary:');
    console.log(`- Direct conversation between ${users[0].name} and ${users[1].name}`);
    if (users.length >= 3) {
      console.log(`- Group conversation with ${users.slice(0, 3).map(u => u.name).join(', ')}`);
    }
    console.log('- Messages are ready for testing');

  } catch (error) {
    console.error('❌ Error seeding chat data:', error);
  }
}

seedChatData().catch(console.error);
