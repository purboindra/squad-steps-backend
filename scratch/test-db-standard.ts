import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Try standard connection string (non-SRV)
// We need the replica set name, but let's try just one host first to see if it works
const uri = "mongodb://Users:5oAZSKLFTHf7gYwR@ac-vzhfkr2-shard-00-00.6nay56n.mongodb.net:27017/squad-steps?ssl=true&authSource=admin";

async function testConnection() {
  console.log("Testing STANDARD connection to:", uri.replace(/:[^@]+@/, ":****@"));
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully!");
    const db = client.db("squad-steps");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
  }
}

testConnection();
