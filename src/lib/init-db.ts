import { migrate } from 'drizzle-orm/libsql/migrator';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { seedDemoData } from './demo-data';

async function initializeDatabase() {
  console.log('🚀 Initializing database...');

  try {
    // Create database connection
    const client = createClient({
      url: process.env.DATABASE_URL || 'file:./boostfund.db',
    });

    const db = drizzle(client);

    // Run migrations
    console.log('📋 Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed');

    // Seed demo data
    console.log('🌱 Seeding demo data...');
    const seedResult = await seedDemoData();
    
    if (seedResult.success) {
      console.log('✅ Demo data seeded successfully');
      console.log('📊 Seeded data:', seedResult.data);
    } else {
      console.error('❌ Demo data seeding failed:', seedResult.error);
      throw new Error(seedResult.error);
    }

    console.log('🎉 Database initialization completed successfully!');
    return { success: true, message: 'Database initialized successfully', data: seedResult.data };

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return { 
      success: false, 
      message: 'Database initialization failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then((result) => {
      console.log(result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { initializeDatabase };