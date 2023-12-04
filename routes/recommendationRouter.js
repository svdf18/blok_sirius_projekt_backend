import { Router } from "express";
import connection from "../db.js";

const recommendationRouter = Router();

// Read all recommendations
recommendationRouter.get("/", (req, res) => {
  const query = "SELECT * FROM recommendations";

  connection.query(query, (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for recommendations' });
    } else {
      res.json(readRes);
    }
  });
});

// Read recommendation by id
recommendationRouter.get("/:recommendation_id", (req, res) => {
  const recommendationId = req.params.recommendation_id;
  const query = 'SELECT * FROM recommendations WHERE recommendation_id = ?';

  connection.query(query, [recommendationId], (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for the recommendation' });
    } else {
      if (readRes.length > 0) {
        res.json(readRes[0]);
      } else {
        res.status(404).json({ error: 'recommendation not found' });
      }
    }
  });
});

// Create recommendation
recommendationRouter.post("/", (req, res) => {
  const { created_by_id, tagged_user_id, content, category } = req.body;

  const createQuery = 'INSERT INTO recommendations (created_by_id, tagged_user_id, content, category) VALUES (?, ?, ?, ?)';
  connection.query(createQuery, [created_by_id, tagged_user_id, content, category], (createErr, createRes) => {
    if (createErr) {
      console.error('Error occurred while creating the recommendation:', createErr);
      return res.status(500).json({ error: 'An error occurred while creating the recommendation' });
    }
    const newrecommendationId = createRes.insertId;
    return res.status(201).json({ recommendation_id: newrecommendationId, message: 'recommendation created successfully' });
  });
});

// Update recommendation
recommendationRouter.put("/:recommendation_id", (req, res) => {
  const { created_by_id, tagged_user_id, content, category } = req.body;
  const recommendationId = req.params.recommendation_id;

  const updateQuery = 'UPDATE recommendations SET created_by_id = ?, tagged_user_id = ?, content = ?, category = ? WHERE recommendation_id = ?';
  connection.query(updateQuery, [created_by_id, tagged_user_id, content, category, recommendationId], (updateErr, updateRes) => {
    if (updateErr) {
      console.error(updateErr);
      return res.status(500).json({ error: 'An error occurred while updating the recommendation' });
    }
    return res.status(200).json({ recommendation_id: recommendationId, message: 'recommendation updated successfully' });
  });
});

// Delete a recommendation by recommendation_id
recommendationRouter.delete("/:recommendation_id", (req, res) => {
  const recommendationId = req.params.recommendation_id;

  const checkQuery = 'SELECT recommendation_id FROM recommendations WHERE recommendation_id = ?';
  connection.query(checkQuery, [recommendationId], (checkErr, checkRes) => {
    if (checkErr) {
      console.log(checkErr);
      return res.status(500).json({ error: 'An error occurred while checking the recommendation' });
    }
    if (checkRes.length === 0) {
      return res.status(404).json({ error: 'recommendation not found' });
    }

    const deleteQuery = 'DELETE FROM recommendations WHERE recommendation_id = ?';

    connection.query(deleteQuery, [recommendationId], (deleteErr, deleteRes) => {
      if (deleteErr) {
        console.log(deleteErr);
        res.status(500).json({ error: 'An error occurred while deleting the recommendation' });
      } else {
        res.status(200).json({ message: 'recommendation deleted successfully' });
      }
    });
  });
});

export { recommendationRouter };