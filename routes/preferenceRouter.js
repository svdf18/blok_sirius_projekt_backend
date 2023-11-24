import { Router } from "express";
import connection from "../db.js";

const preferenceRouter = Router();


// Read all preferences
preferenceRouter.get("/", (req, res) => {
  const query = "SELECT * FROM user_preferences";

    connection.query(query, (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for user preferences' });
    } else {
      res.json(readRes);
    }
  });
});

// Read user_preferences by id
preferenceRouter.get("/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const query = 'SELECT * FROM user_preferences WHERE user_id = ?';
  
  connection.query(query, [userId], (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for user preferences' }); 
    } else {
      if (readRes.length > 0) {
        res.json(readRes[0]);
      } else {
        res.status(404).json({ error: 'User preferences not found' });
      }
    }
  });
});


// POST route for user preferences
preferenceRouter.post('/', (req, res) => {
  const { user_id, user_preferences } = req.body;

  // Check if the user with the specified user_id exists
  const checkUserQuery = 'SELECT user_id FROM users WHERE user_id = ?';
  connection.query(checkUserQuery, [user_id], (checkUserErr, userResults) => {
    if (checkUserErr) {
      console.error(checkUserErr);
      return res.status(500).json({ error: 'An error occurred while checking user existence' });
    }
    if (userResults.length === 0) {
      return res.status(400).json({ error: 'User with the specified user_id does not exist' });
    }

    const insertQuery = 'INSERT INTO user_preferences (user_id, user_preferences) VALUES (?, ?)';
    connection.query(insertQuery, [user_id, user_preferences], (insertErr, result) => {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ error: 'An error occurred while saving user preferences' });
      }

      // Return a success response
      return res.status(201).json({ message: 'User preferences saved successfully' });
    });
  });
});

export { preferenceRouter };