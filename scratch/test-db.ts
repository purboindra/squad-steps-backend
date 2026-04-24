import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGO_DB_URI;

async function testConnection() {
  console.log("Testing connection to:", uri);
  const client = new MongoClient(uri!);
  try {
    await client.connect();
    console.log("Connected successfully!");
    await client.db("admin").command({ ping: 1 });
    console.log("Ping successful!");
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
  }
}

testConnection();
