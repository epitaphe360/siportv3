import { SupabaseService } from '../services/supabaseService';

export async function testChatTables() {
  console.log('🔍 Testing chat tables...');

  try {
    // Test getConversations
    console.log('📨 Testing getConversations...');
    const conversations = await SupabaseService.getConversations('test-user-id');
    console.log('✅ getConversations works:', conversations.length, 'conversations');

    // Test getMessages (if we have a conversation)
    if (conversations.length > 0) {
      console.log('💬 Testing getMessages...');
      const messages = await SupabaseService.getMessages(conversations[0].id);
      console.log('✅ getMessages works:', messages.length, 'messages');
    }

    console.log('🎉 All chat functions are working!');
    return true;

  } catch (error) {
    console.error('❌ Chat test failed:', error);
    return false;
  }
}

// Auto-run if this script is executed directly
if (typeof window !== 'undefined') {
  window.testChat = testChatTables;
}
