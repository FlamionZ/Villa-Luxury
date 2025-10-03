import mysql from 'mysql2/promise';

// Use connection pool for better performance in serverless
let pool: mysql.Pool | null = null;

export async function getDbConnection(): Promise<mysql.Connection> {
  try {
    console.log('Getting database connection...');
    console.log('Environment variables check:', {
      DB_HOST: !!process.env.DB_HOST,
      DB_USER: !!process.env.DB_USER,
      DB_PASSWORD: !!process.env.DB_PASSWORD,
      DB_NAME: !!process.env.DB_NAME,
      DB_PORT: !!process.env.DB_PORT
    });
    
    if (!pool) {
      console.log('Creating new database pool...');
      
      const config: mysql.PoolOptions = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'villa_paradise',
        port: parseInt(process.env.DB_PORT || '3306'),
        
        // Serverless optimized connection pooling
        connectionLimit: 3,           // Lower limit for serverless
        idleTimeout: 180000,          // 3 minutes for serverless
        
        // Connection optimization
        dateStrings: true,
        supportBigNumbers: true,
        bigNumberStrings: true,
        
        // Performance optimization
        enableKeepAlive: true
      };

      // Add SSL if connecting to SkySql/PlanetScale or any cloud database
      if (process.env.DB_HOST?.includes('skysql.com') || process.env.DB_HOST?.includes('planetscale.com') || process.env.NODE_ENV === 'production') {
        config.ssl = {
          rejectUnauthorized: false
        };
      }

      console.log('Pool config:', {
        host: config.host,
        user: config.user,
        database: config.database,
        port: config.port,
        ssl: !!config.ssl
      });

      pool = mysql.createPool(config);
      console.log('Database pool created successfully');
    }

    const connection = await pool.getConnection();
    console.log('Connection acquired from pool');
    
    // Test the connection
    await connection.ping();
    console.log('Connection ping successful');
    
    return connection;
  } catch (error) {
    console.error('Database connection error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: (error as any)?.code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errno: (error as any)?.errno,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sqlState: (error as any)?.sqlState,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function closeDbConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}