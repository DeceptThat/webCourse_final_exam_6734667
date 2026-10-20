// Run: node --env-file=.env.local scripts/seed.mjs
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import dns from "node:dns";


dns.setServers(["8.8.8.8", "1.1.1.1"]);

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();
const users = db.collection("users");

await users.createIndex({ username: 1 }, { unique: true });
await users.createIndex({ email: 1 }, { unique: true });

const password = await bcrypt.hash("password123", 10);

const list = [
  { username: "teacher1", email: "teacher1@test.com", role: "Teacher" },
  { username: "teacher2", email: "teacher2@test.com", role: "Teacher" },
  { username: "teacher3", email: "teacher3@test.com", role: "Teacher" },
  { username: "student1", email: "student1@test.com", role: "Student" },
  { username: "student2", email: "student2@test.com", role: "Student" },
  { username: "student3", email: "student3@test.com", role: "Student" },
];

for (const u of list) {
  await users.updateOne(
    { username: u.username },
    { $set: { ...u, password } },
    { upsert: true },
  );
}

console.log("Seeded 6 users. Password for all: password123");
await client.close();