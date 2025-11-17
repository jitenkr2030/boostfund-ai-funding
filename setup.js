#!/usr/bin/env node

/**
 * BoostFund AI - Setup Script
 * This script initializes the database, runs migrations, and seeds demo data
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BoostFund AI - Setting up development environment...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkFileExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.log(`📄 Creating ${description}...`);
    return false;
  }
  return true;
}

// Step 1: Check environment file
const envPath = path.join(__dirname, '.env.local');
if (!checkFileExists(envPath, 'environment file')) {
  console.log('📝 Creating .env.local file...');
  const envContent = `# Database Configuration
# For local development, we'll use SQLite file
DATABASE_URL="file:./boostfund.db"

# Development environment
NODE_ENV="development"

# Next.js Configuration
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="BoostFund AI"
NEXT_PUBLIC_APP_DESCRIPTION="AI-powered funding insights and workflows to accelerate your capital raise"
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created\n');
}

// Step 2: Install dependencies
runCommand('npm install', 'Installing dependencies');

// Step 3: Generate database schema
runCommand('npx drizzle-kit generate', 'Generating database schema');

// Step 4: Run database migrations
runCommand('npx drizzle-kit migrate', 'Running database migrations');

// Step 5: Seed demo data using the API
console.log('🌱 Seeding demo data...');
try {
  // Start the dev server briefly to seed data
  const { spawn } = require('child_process');
  
  // Start server in background
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    detached: true
  });

  console.log('⏳ Starting development server...');
  
  // Wait for server to start
  setTimeout(async () => {
    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:3000/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Demo data seeded successfully');
        console.log('📊 Seeded data:', result.data);
      } else {
        console.log('⚠️ Could not seed demo data via API, you can run:');
        console.log('   curl -X POST http://localhost:3000/api/seed');
      }
    } catch (error) {
      console.log('⚠️ Could not seed demo data via API automatically');
      console.log('   You can seed manually by running:');
      console.log('   curl -X POST http://localhost:3000/api/seed');
    }
    
    // Kill the server
    server.kill();
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Explore the funding platform with demo data');
    console.log('\n📚 Available commands:');
    console.log('   npm run dev       - Start development server');
    console.log('   npm run build     - Build for production');
    console.log('   npm run db:seed   - Seed demo data');
    console.log('   npm run db:studio - Open database studio');
    
    process.exit(0);
  }, 10000); // Wait 10 seconds for server to start
  
} catch (error) {
  console.log('⚠️ Automatic seeding failed, but setup is complete');
  console.log('   You can seed demo data manually later');
  console.log('\n🎉 Setup completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Open: http://localhost:3000');
  console.log('   3. Seed demo data: curl -X POST http://localhost:3000/api/seed');
}