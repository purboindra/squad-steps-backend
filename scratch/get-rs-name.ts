import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = "mongodb://Users:5oAZSKLFTHf7gYwR@ac-vzhfkr2-shard-00-00.6nay56n.mongodb.net:27017/squad-steps?ssl=true&authSource=admin";

async function testConnection() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    // @ts-ignore
    const rsName = client.topology?.description?.setName;
    console.log("Replica Set Name:", rsName);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
  }
}

testConnection();
