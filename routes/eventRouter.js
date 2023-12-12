import { Router } from "express";
import connection from "../db.js";

const eventRouter = Router();

// Read all events
eventRouter.get("/", (req, res) => {
  const query = "SELECT * FROM events";

  connection.query(query, (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while fetching events' });
    } else {
      res.json(readRes);
    }
  });
});

// Read event by id
eventRouter.get("/:event_id", (req, res) => {
  const eventId = req.params.event_id;
  const query = 'SELECT * FROM events WHERE event_id = ?';

  connection.query(query, [eventId], (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for the event' });
    } else {
      if (readRes.length > 0) {
        res.json(readRes[0]);
      } else {
        res.status(404).json({ error: 'Event not found' });
      }
    }
  });
});

// Create event
eventRouter.post("/", (req, res) => {
  const { created_by_id, title, description, date, start_time, end_time, location } = req.body;

  const createQuery =
    'INSERT INTO events (created_by_id, title, description, date, start_time, end_time, location) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  connection.query(
    createQuery,
    [created_by_id, title, description, date, start_time, end_time, location],
    (createErr, createRes) => {
      if (createErr) {
        console.error('Error occurred while creating the event:', createErr);
        return res
          .status(500)
          .json({ error: 'An error occurred while creating the event' });
      }
      const newEvent = createRes.insertId;
      return res
        .status(201)
        .json({ event_id: newEvent, message: 'Event created successfully' });
    }
  );
});

// eventRouter.post("/", async (req, res, next) => {
//   const { created_by_id, title, description, date, start_time, end_time, location } = req.body;

//   const createQuery =
//     'INSERT INTO events (created_by_id, title, description, date, start_time, end_time, location) VALUES (?, ?, ?, ?, ?, ?, ?)';

//   // Start a transaction
//   try {
//     await promisify(connection.beginTransaction.bind(connection))();

//     const createRes = await promisify(connection.query.bind(connection))(createQuery, [created_by_id, title, description, date, start_time, end_time, location]);

//     // Commit the transaction
//     await promisify(connection.commit.bind(connection))();

//     // Pass the new event ID to the next middleware
//     req.newEventId = createRes.insertId;
//     next();
//   } catch (error) {
//     // Rollback the transaction in case of an error
//     await promisify(connection.rollback.bind(connection))();
//     console.error('Transaction rolled back due to error:', error);
//     res.status(500).json({ error: 'An error occurred while processing the request' });
//   }
// });

// Update event details
eventRouter.put("/:event_id", (req, res) => {
  const { created_by_id, title, description, date, start_time, end_time, location } = req.body;
  const eventId = req.params.event_id;

  const updateQuery =
    'UPDATE events SET created_by_id = ?, title = ?, description = ?, date = ?, start_time = ?, end_time = ?, location = ? WHERE event_id = ?';

  connection.query(
    updateQuery,
    [created_by_id, title, description, date, start_time, end_time, location, eventId],
    (updateErr, updateRes) => {
      if (updateErr) {
        console.error(updateErr);
        return res
          .status(500)
          .json({ error: 'An error occurred while updating the event details' });
      }
      return res
        .status(200)
        .json({ event_id: eventId, message: 'Event details updated successfully' });
    }
  );
});


// Delete an event by event_id
eventRouter.delete("/:event_id", (req, res) => {
  const eventId = req.params.event_id;

  const checkQuery = 'SELECT event_id FROM events WHERE event_id = ?';
  connection.query(checkQuery, [eventId], (checkErr, checkRes) => {
    if (checkErr) {
      console.log(checkErr);
      return res.status(500).json({ error: 'An error occurred while checking the event' });
    }
    if (checkRes.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const deleteQuery = 'DELETE FROM events WHERE event_id = ?';

    connection.query(deleteQuery, [eventId], (deleteErr, deleteRes) => {
      if (deleteErr) {
        console.log(deleteErr);
        res.status(500).json({ error: 'An error occurred while deleting the event' });
      } else {
        res.status(200).json({ message: 'Event and related data deleted successfully' });
      }
    });
  });
});

export { eventRouter };