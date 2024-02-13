// Imports
import express from "express";
import db from "./database.js";
import cors from "cors";
import { ObjectId } from "mongodb";


// INSERT contacts.js data i databasen
//async function insertContacts() {
  //  const [existingContacts] = await db.execute("SELECT * FROM contacts");
    //if (existingContacts.length > 0) {
        // If there are already contacts in the database, do nothing
      //  return;
    //}

    //const existingIds = new Set(existingContacts.map(contact => contact._id));
    
    //for (let contact of contacts) {
      //  if (!existingIds.has(contact.id)) {
        //    const { avatar, first: firstname, last: lastname, twitter } = contact;
          //  const query = 'INSERT INTO contacts (_id, avatar, firstname, lastname, twitter) VALUES (?, ?, ?, ?, ?)';
            //await db.execute(query, [contact.id, avatar, firstname, lastname, twitter]);
        //}
    //}
//}

// INSERT contacts uden at blokere for andre ting
//insertContacts().catch(console.error);

// ========== Setup ========== //

// Create Express app
const server = express();
const PORT = process.env.PORT;


// Configure middleware 

// Parse JSON bodies
server.use(express.json());

// Enable CORS
server.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000']
}));
    
// ========== Routes ========== //

// Root route
//server.get("/", (req, res) => {
		//db.command({ ping: 1 });
    //res.send("Node.js REST API with Express.js and MongoDB")
//});

server.get("/", (req, res) => {
   res.send("Node.js REST API with Express.js and MongoDB")
}
);
    
    


// MongoDB Route der henter alle contacts fra databasen
server.get("/contacts", async (req, res) => {
const contacts = await db
    .collection("contacts")
    .find()
    .sort({ first: 1, last: 1 })
    .toArray();
res.json(contacts);
}
);

// Search contacts GET, der på baggrund af req.query.q returnerer en json liste med alle contacts hvor firstname, lastname eller twitter indeholder q, ignorer case sensitivity, returner en liste med de kontakter der matcher

server.get("/contacts/search", async (req, res) => {
  const searchString = req.query.q.toLowerCase(); // get query string from request URL and lowercase it
  const query = {
      $or: [
          { first: { $regex: searchString, $options: "i" } },
          { last: { $regex: searchString, $options: "i" } },
      ],
  }; // MongoDB query

  const results = await db
      .collection("contacts") // Get the contacts collection from the database
      .find(query) // Find contacts matching query
      .sort({ first: 1, last: 1 }) // Sort by first name, then last name
      .toArray(); // Execute the query

  res.json(results); // Send the results as JSON
});


// MongoDB create new contact (POST) brug .insertOne() til at indsætte en ny contact i databasen og returner id på den nye contact
// VIRKER

server.post("/contacts", async (req, res) => {
  const newContact = req.body; // get new contact object from request body

  const result = await db.collection("contacts").insertOne(newContact); // Insert new contact into database

  if (result.acknowledged) {
      res.json({ message: "Created new contact", _id: result.insertedId }); // return message and id of new contact
  } else {
      res.status(500).json({ message: "Failed to create new contact" }); // return error message
  }
});

// Update contact opdater en eksisterende contact i databasen og returner id på den opdaterede contact

server.get("/contacts/:id", async (req, res) => {
  const id = req.params.id; // get id from request URL

  try {
      const objectId = new ObjectId(id); // create ObjectId from id
      const contact = await db
          .collection("contacts")
          .findOne({ _id: objectId }); // Get contact from database

      if (contact) {
          res.json(contact); // return first contact from results as JSON
      } else {
          res.status(404).json({ message: "Contact not found" }); // otherwise return 404 and error message
      }
  } catch (error) {
      res.status(400).json({ message: "Invalid ObjectId" }); // return 400 and error message for invalid ObjectId
  }
});

// PUT Route til at opdatere en contact i databasen og returner en json message prop med en besked om at en contact er blevet opdateret

server.put("/contacts/:id", async (req, res) => {
  const id = req.params.id; // get id from request URL
  try {
      const objectId = new ObjectId(id); // create ObjectId from id
      const updatedContact = req.body; // get updated properties from request body
      const result = await db
          .collection("contacts")
          .updateOne({ _id: objectId }, { $set: updatedContact }); // Update contact in database

      if (result.acknowledged) {
          res.json({ message: `Updated contact with id ${id}` }); // return message
      } else {
          res.status(500).json({ message: "Failed to update contact" }); // return error message
      }
  } catch (error) {
      res.status(400).json({ message: "Invalid ObjectId" }); // return 400 and error message for invalid ObjectId
  }
});


// Delete a contact (DELETE) using ObjectId() to delete a contact by id

server.delete("/contacts/:id", async (req, res) => {
  const id = req.params.id; // get id from request URL

  try {
      const objectId = new ObjectId(id); // create ObjectId from id
      const result = await db
          .collection("contacts")
          .deleteOne({ _id: objectId }); // Delete contact from database

      if (result.acknowledged) {
          res.json({ message: `Deleted contact with id ${id}` }); // return message
      } else {
          res.status(500).json({ message: "Failed to delete contact" }); // return error message
      }
  } catch (error) {
      res.status(400).json({ message: "Invalid ObjectId" }); // return 400 and error message for invalid ObjectId
  }
});



// PUT Route til at finde en favorit contact og sætte den til true, og returner en json message prop med en besked om at en contact er toggled til favorit

server.put("/contacts/:id/favorite", async (req, res) => {
    try {
        const _id = req.params.id; // Hent kontaktens ID fra URL-parametrene
        const contact = await db.collection("contacts").findOne({ _id: new ObjectId(_id) }); // Find kontakten i databasen

        if (!contact) {
            // Hvis kontakt ikke findes, returner en fejlmeddelelse
            res.status(404).json({ message: "Contact not found" });
            return;
        }

        // Toggle 'favorite' egenskaben
        contact.favorite = !contact.favorite;

        // Opdater kontakt i databasen med den nye 'favorite' værdi
        const result = await db.collection("contacts").updateOne(
            { _id: new ObjectId(_id) }, // Brug ObjectId(_id) som filter
            { $set: { favorite: contact.favorite } }
        );

        if (result.modifiedCount === 0) {
            // Hvis ingen kontakter blev opdateret, returner en fejlmeddelelse
            res.status(500).json({ message: "Error updating contact" });
            return;
        }

        // Returner en succesmeddelelse med den opdaterede kontakt
        res.json({ message: `Contact ${contact.first} ${contact.last}'s favorite status toggled to ${contact.favorite}` });
    } catch (error) {
        console.error("Error toggling favorite status:", error); // Udskriv fejlen til konsollen for yderligere fejlfinding
        res.status(500).json({ message: "Error toggling favorite status", error });
    }
});



// Implementer en GET route der returnerer en json liste med alle contacts hvor favorit er true

server.get("/contacts/favorites", async (req, res) => {

    try {
        const contacts = await db.collection("contacts").find({ favorite: true }).toArray();
        res.json(contacts);
    } catch (error) {
        console.error("Error getting favorite contacts:", error); // Udskriv fejlen til konsollen for yderligere fejlfinding
        res.status(500).json({ message: "Error getting favorite contacts", error });
    }
}
);

// Toggle favorite property of contact (PUT /contacts/:id/favorite)
server.patch("/contacts/:id/favorite", async (req, res) => {
  const id = req.params.id; // get id from request URL

  try {
      const objectId = new ObjectId(id); // create ObjectId from id
      const contact = await db
          .collection("contacts")
          .findOne({ _id: objectId }); // Get the contact from the database

      if (contact) {
          const newFavoriteValue = !contact.favorite; // Toggle the favorite field
          // Update the contact in the database
          await db
              .collection("contacts")
              .updateOne(
                  { _id: objectId },
                  { $set: { favorite: newFavoriteValue } }
              );

          res.json({
              message: `Toggled favorite property of contact with id ${id}`,
          }); // return message
      } else {
          res.status(404).json({ message: "Contact not found!" }); // return 404 if contact was not found
      }
  } catch (error) {
      res.status(400).json({ message: "Invalid ObjectId" }); // return 400 and error message for invalid ObjectId
  }
});

// Read one contact GET, der på baggrund af id returnerer en json contact med finone() og ObjectId() til at finde en contact by id

server.get("/contacts/:id", async (req, res) => {

    try {
        const _id = req.params.id; // Hent kontaktens ID fra URL-parametrene
        const contact = await db.collection("contacts").findOne({ _id: new ObjectId(_id) }); // Find kontakten i databasen

        if (!contact) {
            // Hvis kontakt ikke findes, returner en fejlmeddelelse
            res.status(404).json({ message: "Contact not found" });
            return;
        }

        // Returner kontakt
        res.json(contact);
    } catch (error) {
        console.error("Error getting contact:", error); // Udskriv fejlen til konsollen for yderligere fejlfinding
        res.status(500).json({ message: "Error getting contact", error });
    }
}
);

    



//server.put("/contacts/:id", async (req, res) => {
  //  const id = req.params.id;
    //const contact = req.body;
    //const [existingContacts] = await db.query("SELECT * FROM contacts WHERE id = ?", [id]);
    //if (existingContacts.length > 0) {
      //  const query = 'UPDATE contacts SET avatar = ?, firstname = ?, lastname = ?, twitter = ? WHERE id = ?';
        //const values = [contact.avatar, contact.firstname, contact.lastname, contact.twitter, id];
        //const [result] = await db.query(query, values);
        //res.json(result);
    //} else {
      //  res.status(404).json({ message: "Contact not found" });
    //}
//});



// Search for contacts with req.query.q and error handling

//server.get("/contacts/search", async (req, res) => {
   // console.log(req.query);
   // const searchString = req.query.q.toLowerCase();
   // const query = "SELECT * FROM contacts WHERE LOWER(firstname) LIKE ? OR LOWER(lastname) LIKE ? OR LOWER(twitter) LIKE ?";
   // const values = [`%${searchString}%`, `%${searchString}%`, `%${searchString}%`];
   // const [results] = await db.execute(query, values);

   // if (results.length === 0) {
    //    res.status(404).json({ message: "No contacts found" });
    //    return;
   // }
   // res.json(results);
//}
//);

// GET all contacts
//server.get("/contacts", async (req, res) => {
  //  const [contacts] = await db.query('SELECT * FROM contacts');
    //res.json(contacts);
//});

// GET route to fetch a contact by id
//server.get("/contacts/:id", async (req, res) => {
  //  const id = req.params.id;
    //const [contacts] = await db.query("SELECT * FROM contacts WHERE id = ?", [id]);
    //if (contacts.length > 0) {
      //  res.json(contacts[0]);
    //} else {
      //  res.status(404).json({ message: "Contact not found" });
    //}
//});


// POST create a contact
//server.post("/contacts", async (req, res) => {
  //  const contact = req.body;
    //const [existingContacts] = await db.query("SELECT * FROM contacts WHERE id = ?", [contact.id]);
    //if (existingContacts.length > 0) {
      //  res.status(400).json({ message: "Contact with this id already exists" });
    //} else {
      //  const query = 'INSERT INTO contacts (id, avatar, firstname, lastname, twitter) VALUES (?, ?, ?, ?, ?)';
        //const values = [contact.id, contact.avatar, contact.firstname, contact.lastname, contact.twitter];
        //const [result] = await db.query(query, values);
        //res.json(result);
    //}
//});


// PUT update a contact by id
//server.put("/contacts/:id", async (req, res) => {
  //  const id = req.params.id;
    //const contact = req.body;
    //const [existingContacts] = await db.query("SELECT * FROM contacts WHERE id = ?", [id]);
    //if (existingContacts.length > 0) {
      //  const query = 'UPDATE contacts SET avatar = ?, firstname = ?, lastname = ?, twitter = ? WHERE id = ?';
        //const values = [contact.avatar, contact.firstname, contact.lastname, contact.twitter, id];
        //const [result] = await db.query(query, values);
        //res.json(result);
    //} else {
      //  res.status(404).json({ message: "Contact not found" });
    //}
//});


// DELETE delete a contact by id
//server.delete("/contacts/:id", async (req, res) => {
  //  const id = req.params.id;
    //const [existingContacts] = await db.query("SELECT * FROM contacts WHERE id = ?", [id]);
    //if (existingContacts.length > 0) {
      //  const query = 'DELETE FROM contacts WHERE id = ?';
        //const values = [id];
        //const [result] = await db.query(query, values);
       // res.json(result);
    //} else {
      //  res.status(404).json({ message: "Contact not found" });
    //}
//});


// ========== Start server ========== //

// Create a new note on a contact (POST /contacts/:id/notes)

server.post("/contacts/:id/notes", async (req, res) => {
  const id = req.params.id; // get id from request URL

  try {
    const objectId = new ObjectId(id); // create ObjectId from id
    const note = req.body; // get note object from request body
    const result = await db
      .collection("contacts")
      .updateOne(
        { _id: objectId },
        { $push: { notes: note } }
      ); // Add note to contact in database

      if (result.acknowledged) {
        res.json({ message: `Added note to contact with id ${id}` }); // return message
      } else {
        res.status(500).json({ message: "Failed to add note to contact" }); // return error message
      }

      } catch (error) {
        res.status(400).json({ message: "Invalid ObjectId" }); // return 400 and error message for invalid ObjectId
      }
    }
);


// Retrieve a single note from a contact (GET /contacts/:contactId/notes/:noteIndex)
server.get("/contacts/:contactId/notes/:noteIndex", async (req, res) => {
  const contactId = req.params.contactId; // get contactId from request URL
  const noteIndex = parseInt(req.params.noteIndex); // get noteIndex from request URL and parse it as an integer

  try {
      const objectId = new ObjectId(contactId); // create ObjectId from contactId
      const contact = await db
          .collection("contacts")
          .findOne({ _id: objectId }); // Get the contact from the database

      if (contact) {
          const note = contact.notes[noteIndex];
          if (!note) {
              res.status(404).json({ message: "Note not found" });
          }
          res.json(note);
      } else {
          res.status(404).json({ message: "Contact not found" });
      }
  } catch (error) {
      res.status(400).json({ message: "Invalid ObjectId" }); // return 400 and error message for invalid ObjectId
  }
});



// Start server on port 4000
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


