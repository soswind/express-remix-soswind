// import mysql from "mysql2/promise"; // using mysql2 - installed npm library
// Alt der er kommenteret ud, er hvis man bruger mysql2!
// using the variables from the .env file
// and creates the connection to database
//const db = await mysql.createConnection({
    //host: process.env.MYSQL_HOST,
    //port: process.env.MYSQL_PORT,
   // user: process.env.MYSQL_USER,
    //password: process.env.MYSQL_PASSWORD,
    //multipleStatements: true
//});

// exports database connection
//export default db;




// BRUGER MONGODB I STEDET FOR MYSQL2

import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function getDatabase() {
    try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DATABASE);
        return db;
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        throw error;
    }
}

// Automatically close the database connection when the Node.js process exits
process.on("exit", async () => {
    await client.close();
});

// Handle CTRL+C events
process.on("SIGINT", async () => {
    await client.close();
    process.exit();
});

const db = await getDatabase(); // Connect to the MongoDB database

export default db;
