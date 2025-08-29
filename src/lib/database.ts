import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;

export async function getDbConnection(): Promise<mysql.Connection> {
  if (connection) {
    try {
      // Test if connection is still alive
      await connection.ping();
      return connection;
    } catch (_error) {
      // Connection is dead, create a new one
      connection = null;
    }
  }

  try {
    // Always use individual env vars to avoid URL encoding issues with special characters
    const config: mysql.ConnectionOptions = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'villa_paradise',
      port: parseInt(process.env.DB_PORT || '3306')
    };

    // Add SSL if connecting to SkySql/PlanetScale
    if (process.env.DB_HOST?.includes('skysql.com')) {
      config.ssl = {
        rejectUnauthorized: false
      };
    }

    connection = await mysql.createConnection(config);

    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function closeDbConnection(): Promise<void> {
  if (connection) {
    await connection.end();
    connection = null;
  }
}