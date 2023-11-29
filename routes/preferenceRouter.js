import { Router } from "express";
import connection from "../db.js";

const preferenceRouter = Router();

// Read all user preferences
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

// Read user preferences by user_id
preferenceRouter.get("/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const query = 'SELECT * FROM user_preferences WHERE user_id = ?';

  connection.query(query, [userId], (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for user preferences' });
    } else {
      if (readRes.length > 0) {
        res.json(readRes);
      } else {
        res.status(404).json({ error: 'User preferences not found for the given user' });
      }
    }
  });
});

// Create user preferences
preferenceRouter.post("/", (req, res) => {
  const { user_id, user_preferences } = req.body;

  const createQuery = 'INSERT INTO user_preferences (user_id, user_preferences) VALUES (?, ?)';
  connection.query(createQuery, [user_id, user_preferences], (createErr, createRes) => {
    if (createErr) {
      console.error('Error occurred while creating user preferences:', createErr);
      return res.status(500).json({ error: 'An error occurred while creating user preferences' });
    }
    const newPreferenceId = createRes.insertId;
    return res.status(201).json({ preference_id: newPreferenceId, message: 'User preferences created successfully' });
  });
});

// Update user preferences
preferenceRouter.put("/:preference_id", (req, res) => {
  const { user_id, user_preferences } = req.body;
  const preferenceId = req.params.preference_id;

  const updateQuery = 'UPDATE user_preferences SET user_id = ?, user_preferences = ? WHERE preference_id = ?';
  connection.query(updateQuery, [user_id, user_preferences, preferenceId], (updateErr, updateRes) => {
    if (updateErr) {
      console.error(updateErr);
      return res.status(500).json({ error: 'An error occurred while updating user preferences' });
    }
    return res.status(200).json({ preference_id: preferenceId, message: 'User preferences updated successfully' });
  });
});

// Delete user preferences by preference_id
preferenceRouter.delete("/:preference_id", (req, res) => {
  const preferenceId = req.params.preference_id;

  const checkQuery = 'SELECT preference_id FROM user_preferences WHERE preference_id = ?';
  connection.query(checkQuery, [preferenceId], (checkErr, checkRes) => {
    if (checkErr) {
      console.log(checkErr);
      return res.status(500).json({ error: 'An error occurred while checking user preferences' });
    }
    if (checkRes.length === 0) {
      return res.status(404).json({ error: 'User preferences not found' });
    }

    const deleteQuery = 'DELETE FROM user_preferences WHERE preference_id = ?';

    connection.query(deleteQuery, [preferenceId], (deleteErr, deleteRes) => {
      if (deleteErr) {
        console.log(deleteErr);
        res.status(500).json({ error: 'An error occurred while deleting user preferences' });
      } else {
        res.status(200).json({ message: 'User preferences deleted successfully' });
      }
    });
  });
});

export { preferenceRouter };