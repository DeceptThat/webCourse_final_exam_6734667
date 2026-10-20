// src/lib/mongodb.js
// src/lib/mongodb.js

import dns from "node:dns";
import { MongoClient } from "mongodb";

// Fix querySrv ECONNREFUSED on local Windows (not needed on Vercel)
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const options = {};
let globalClientPromise;

export function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please add your Mongo URI to .env.local or set MONGODB_URI env variable",
    );
  }
  if (process.env.NODE_ENV === "development") {
    if (!globalClientPromise) {
      const client = new MongoClient(uri, options);
      globalClientPromise = client.connect();
    }
    return globalClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    return client.connect();
  }
}


// import { MongoClient } from "mongodb";

// const options = {};
// let globalClientPromise;

// export function getClientPromise() {
//   const uri = process.env.MONGODB_URI;
//   if (!uri) {
//     throw new Error(
//       "Please add your Mongo URI to .env.local or set MONGODB_URI env variable",
//     );
//   }
//   if (process.env.NODE_ENV === "development") {
//     if (!globalClientPromise) {
//       const client = new MongoClient(uri, options);
//       globalClientPromise = client.connect();
//     }
//     return globalClientPromise;
//   } else {
//     const client = new MongoClient(uri, options);
//     return client.connect();
//   }
// }
