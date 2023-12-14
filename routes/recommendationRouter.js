import { Router } from "express";
import connection from "../db.js";

const recommendationRouter = Router();

// Read all recommendations
recommendationRouter.get("/", (req, res) => {
  const query = "SELECT * FROM recommendations ORDER BY title";

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

// Create recommendation // Check on passed created_by_id and set that at the same time
recommendationRouter.post("/", (req, res) => {
  const { created_by_id, tagged_user_id, title, content, recommendation_url, category } = req.body;

  // Check user_type for permission to post
  const userTypeQuery = 'SELECT user_type FROM users WHERE user_id = ?';
  connection.query(userTypeQuery, [created_by_id], (userTypeErr, userTypeRes) => {
    if (userTypeErr) {
      console.error('Error occurred while checking user_type:', userTypeErr);
      return res.status(500).json({ error: 'An error occurred while checking user_type' });
    }

    const user_type = userTypeRes[0]?.user_type;

    // Check user_type permission
    if (user_type === 'admin') {
      // User with admin rights can post
      const createQuery = 'INSERT INTO recommendations (created_by_id, tagged_user_id, title, content, recommendation_url, category) VALUES (?, ?, ?, ?, ?, ?)';
      connection.query(createQuery, [created_by_id, tagged_user_id, title, content, recommendation_url, category], (createErr, createRes) => {
        if (createErr) {
          console.error('Error occurred while creating the recommendation:', createErr);
          return res.status(500).json({ error: 'An error occurred while creating the recommendation' });
        }
        const newRecommendationId = createRes.insertId;
        return res.status(201).json({ recommendation_id: newRecommendationId, message: 'Recommendation created successfully' });
      });
    } else {
      // User without admin rights cannot post
      console.error('User does not have the necessary permissions to post recommendations');
      return res.status(403).json({ error: 'User does not have the necessary permissions to post recommendations' });
    }
  });
});


recommendationRouter.put("/:recommendation_id", (req, res) => {
  const {
    created_by_id,
    tagged_user_id,
    title,
    content,
    recommendation_url,
    category,
    updated_by_id // You'll get this from the frontend
  } = req.body;
  const recommendationId = req.params.recommendation_id;

  // Check user_type for permission to update
  const userTypeQuery = 'SELECT user_type, user_id FROM users WHERE user_id = ?';
  connection.query(userTypeQuery, [updated_by_id], (userTypeErr, userTypeRes) => {
    if (userTypeErr) {
      console.error('Error occurred while checking user_type:', userTypeErr);
      return res.status(500).json({ error: 'An error occurred while checking user_type' });
    }

    const { user_type, user_id } = userTypeRes[0] || {};

    // Check user_type permission
    if (user_type === 'admin') {
      // User with admin rights can update
      const updateQuery = 'UPDATE recommendations SET created_by_id = ?, tagged_user_id = ?, title = ?, content = ?, recommendation_url = ?, category = ?, updated_by_id = ? WHERE recommendation_id = ?';
      connection.query(
        updateQuery,
        [created_by_id, tagged_user_id, title, content, recommendation_url, category, user_id, recommendationId],
        (updateErr, updateRes) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({ error: 'An error occurred while updating the recommendation' });
          }
          return res
            .status(200)
            .json({ recommendation_id: recommendationId, message: 'Recommendation updated successfully' });
        }
      );
    } else {
      // User without admin rights cannot update
      console.error('User does not have the necessary permissions to update recommendations');
      return res
        .status(403)
        .json({ error: 'User does not have the necessary permissions to update recommendations' });
    }
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