import axios from 'axios';
import chalk from 'chalk';
import inquirer from 'inquirer';
import Table from 'cli-table3';

const API_BASE_URL = 'http://localhost:4000/api/mcp';

interface MCPResponse {
  namespace: string;
  data: any;
}

async function queryMCP(namespace: string, query?: Record<string, string>): Promise<MCPResponse> {
  try {
    const response = await axios.get(`${API_BASE_URL}/${encodeURIComponent(namespace)}`, {
      params: query
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`MCP Error: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

function displayChannels(data: any[]) {
  const table = new Table({
    head: ['Channel ID', 'Title', 'Subscribed Since'],
    colWidths: [30, 40, 20]
  });

  data.forEach(channel => {
    table.push([
      channel.id,
      channel.title,
      new Date(channel.subscribedSince).toLocaleDateString()
    ]);
  });

  console.log(table.toString());
}

function displayVideos(data: any[]) {
  const table = new Table({
    head: ['Video ID', 'Title', 'Channel ID', 'Published At'],
    colWidths: [30, 40, 30, 20]
  });

  data.forEach(video => {
    table.push([
      video.id,
      video.title,
      video.channelId,
      new Date(video.publishedAt).toLocaleDateString()
    ]);
  });

  console.log(table.toString());
}

function displayCategories(data: any[]) {
  const table = new Table({
    head: ['Category', 'Channels'],
    colWidths: [20, 60]
  });

  data.forEach(category => {
    table.push([
      category.category,
      category.channels.join(', ')
    ]);
  });

  console.log(table.toString());
}

function displayStats(data: any) {
  const table = new Table({
    head: ['Metric', 'Value'],
    colWidths: [20, 60]
  });

  table.push(
    ['Top Channels', data.topChannels.join(', ')],
    ['Most Watched', data.mostWatchedCategory],
    ['Time Spent', data.timeSpent]
  );

  console.log(table.toString());
}

async function main() {
  console.log(chalk.blue('🎥 YouTube Subscription MCP CLI'));
  console.log(chalk.gray('Query your YouTube subscription data through MCP\n'));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'View Subscribed Channels', value: 'channels' },
        { name: 'View Recent Videos', value: 'videos' },
        { name: 'View Categories', value: 'categories' },
        { name: 'View Stats', value: 'stats' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  if (action === 'exit') {
    console.log(chalk.green('Goodbye! 👋'));
    process.exit(0);
  }

  try {
    let query: Record<string, string> | undefined;
    
    if (action === 'videos') {
      const { limit } = await inquirer.prompt([
        {
          type: 'input',
          name: 'limit',
          message: 'How many videos would you like to see?',
          default: '10'
        }
      ]);
      query = { limit };
    }

    const namespace = `subscriptions://${action}`;
    console.log(chalk.yellow(`\nFetching ${action}...`));
    
    const response = await queryMCP(namespace, query);
    
    console.log(chalk.green('\nResults:'));
    switch (action) {
      case 'channels':
        displayChannels(response.data);
        break;
      case 'videos':
        displayVideos(response.data);
        break;
      case 'categories':
        displayCategories(response.data);
        break;
      case 'stats':
        displayStats(response.data);
        break;
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
  }

  // Ask if user wants to continue
  const { again } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'again',
      message: 'Would you like to make another query?',
      default: true
    }
  ]);

  if (again) {
    main();
  } else {
    console.log(chalk.green('Goodbye! 👋'));
    process.exit(0);
  }
}

main().catch(console.error); 
 