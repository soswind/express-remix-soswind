// Imports
import express from "express";
import db from "./database.js";
import cors from "cors";
import contacts from "./contacts.js";


// INSERT contacts.js data i databasen
async function insertContacts() {
    const [existingContacts] = await db.execute("SELECT * FROM contacts");
    if (existingContacts.length > 0) {
        // If there are already contacts in the database, do nothing
        return;
    }

    const existingIds = new Set(existingContacts.map(contact => contact._id));
    
    for (let contact of contacts) {
        if (!existingIds.has(contact.id)) {
            const { avatar, first: firstname, last: lastname, twitter } = contact;
            const query = 'INSERT INTO contacts (_id, avatar, firstname, lastname, twitter) VALUES (?, ?, ?, ?, ?)';
            await db.execute(query, [contact.id, avatar, firstname, lastname, twitter]);
        }
    }
}

// INSERT contacts uden at blokere for andre ting
insertContacts().catch(console.error);

// ========== Setup ========== //

// Create Express app
const server = express();
const PORT = process.env.PORT;

// Configure middleware 

// Parse JSON bodies
server.use(express.json());

// Enable CORS
server.use(cors());
    
// ========== Routes ========== //

// Root route
server.get("/", (req, res) => {
		db.ping();
    res.send("Node.js REST API with Express.js");
});

// Search for contacts with req.query.q and error handling

server.get("/contacts/search", async (req, res) => {
    console.log(req.query);
    const searchString = req.query.q.toLowerCase();
    const query = "SELECT * FROM contacts WHERE LOWER(firstname) LIKE ? OR LOWER(lastname) LIKE ? OR LOWER(twitter) LIKE ?";
    const values = [`%${searchString}%`, `%${searchString}%`, `%${searchString}%`];
    const [results] = await db.execute(query, values);

    if (results.length === 0) {
        res.status(404).json({ message: "No contacts found" });
        return;
    }
    res.json(results);
}
);

// GET all contacts
server.get("/contacts", async (req, res) => {
    const [contacts] = await db.query('SELECT * FROM contacts');
    res.json(contacts);
});

// GET route to fetch a contact by id
server.get("/contacts/:id", async (req, res) => {
    const id = req.params.id;
    const [contacts] = await db.query("SELECT * FROM contacts WHERE id = ?", [id]);
    if (contacts.length > 0) {
        res.json(contacts[0]);
    } else {
        res.status(404).json({ message: "Contact not found" });
    }
});


// POST create a contact
server.post("/contacts", async (req, res) => {
    const contact = req.body;
    const [existingContacts] = await db.query("SELECT * FROM contacts WHERE id = ?", [contact.id]);
    if (existingContacts.length > 0) {
        res.status(400).json({ message: "Contact with this id already exists" });
    } else {
        const query = 'INSERT INTO contacts (id, avatar, firstname, lastname, twitter) VALUES (?, ?, ?, ?, ?)';
        const values = [contact.id, contact.avatar, contact.firstname, contact.lastname, contact.twitter];
        const [result] = await db.query(query, values);
        res.json(result);
    }
});


// PUT update a contact by id
server.put("/contacts/:id", async (req, res) => {
    const id = req.params.id;
    const contact = req.body;
    const [existingContacts] = await db.query("SELECT * FROM contacts WHERE id = ?", [id]);
    if (existingContacts.length > 0) {
        const query = 'UPDATE contacts SET avatar = ?, firstname = ?, lastname = ?, twitter = ? WHERE id = ?';
        const values = [contact.avatar, contact.firstname, contact.lastname, contact.twitter, id];
        const [result] = await db.query(query, values);
        res.json(result);
    } else {
        res.status(404).json({ message: "Contact not found" });
    }
});


// DELETE delete a contact by id
server.delete("/contacts/:id", async (req, res) => {
    const id = req.params.id;
    const [existingContacts] = await db.query("SELECT * FROM contacts WHERE id = ?", [id]);
    if (existingContacts.length > 0) {
        const query = 'DELETE FROM contacts WHERE id = ?';
        const values = [id];
        const [result] = await db.query(query, values);
        res.json(result);
    } else {
        res.status(404).json({ message: "Contact not found" });
    }
});


// ========== Start server ========== //


// Start server on port 3000
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


