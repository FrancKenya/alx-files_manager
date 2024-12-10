import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.dbClient = null; // Initialize as null
    this.databaseName = database;

    // Establish the connection asynchronously
    this.connectionPromise = this.connect(url);
 }

  async connect(url) {
    try {
      const client = await MongoClient.connect(url, { useUnifiedTopology: true });
      this.dbClient = client.db(this.databaseName);
      console.log('Connected to MongoDB successfully');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      this.dbClient = null;
    }
  }
  async waitConnection() {
    if (!this.connectionPromise) {
      throw new Error('Connection process not started');
    }
    await this.connectionPromise;
    return this.isAlive();
  }
  isAlive() {
    return !!this.dbClient;
  } 

  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('Database is not connected');
    }
    return this.dbClient.collection('users').countDocuments();
  }

  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('Database is not connected');
    }
    return this.dbClient.collection('files').countDocuments();
  }
}

export default new DBClient();