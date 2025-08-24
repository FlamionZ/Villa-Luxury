import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;

export async function getDbConnection(): Promise<mysql.Connection> {
  if (connection) {
    try {
      // Test if connection is still alive
      await connection.ping();
      return connection;
    } catch (error) {
      // Connection is dead, create a new one
      connection = null;
    }
  }

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'villa_paradise',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

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