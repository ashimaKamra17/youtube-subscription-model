import { agentPrompt } from './services/agent';

async function runTests() {
  const testQueries = [
    "Which channels do I watch most?",
    "What are my recent video interests?",
    "How much time do I spend watching YouTube?",
    "What categories of content do I watch?"
  ];

  console.log('🧪 Starting Agent Tests\n');

  for (const query of testQueries) {
    console.log(`\n📝 Testing Query: "${query}"`);
    try {
      const response = await agentPrompt(query);
      console.log('✅ Response:', response);
    } catch (error) {
      console.error('❌ Error:', error);
    }
    console.log('-----------------------------------');
  }
}

runTests().catch(console.error); 