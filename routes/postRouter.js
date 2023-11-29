import { Router } from "express";
import connection from "../db.js";

const postRouter = Router();

// Read all posts
postRouter.get("/", (req, res) => {
  const query = "SELECT * FROM posts";

  connection.query(query, (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for posts' });
    } else {
      res.json(readRes);
    }
  });
});

// Read post by id
postRouter.get("/:post_id", (req, res) => {
  const postId = req.params.post_id;
  const query = 'SELECT * FROM posts WHERE post_id = ?';

  connection.query(query, [postId], (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for the post' });
    } else {
      if (readRes.length > 0) {
        res.json(readRes[0]);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    }
  });
});

// Create post
postRouter.post("/", (req, res) => {
  const { created_by_id, tagged_user_id, content, category } = req.body;

  const createQuery = 'INSERT INTO posts (created_by_id, tagged_user_id, content, category) VALUES (?, ?, ?, ?)';
  connection.query(createQuery, [created_by_id, tagged_user_id, content, category], (createErr, createRes) => {
    if (createErr) {
      console.error('Error occurred while creating the post:', createErr);
      return res.status(500).json({ error: 'An error occurred while creating the post' });
    }
    const newPostId = createRes.insertId;
    return res.status(201).json({ post_id: newPostId, message: 'Post created successfully' });
  });
});

// Update post
postRouter.put("/:post_id", (req, res) => {
  const { created_by_id, tagged_user_id, content, category } = req.body;
  const postId = req.params.post_id;

  const updateQuery = 'UPDATE posts SET created_by_id = ?, tagged_user_id = ?, content = ?, category = ? WHERE post_id = ?';
  connection.query(updateQuery, [created_by_id, tagged_user_id, content, category, postId], (updateErr, updateRes) => {
    if (updateErr) {
      console.error(updateErr);
      return res.status(500).json({ error: 'An error occurred while updating the post' });
    }
    return res.status(200).json({ post_id: postId, message: 'Post updated successfully' });
  });
});

// Delete a post by post_id
postRouter.delete("/:post_id", (req, res) => {
  const postId = req.params.post_id;

  const checkQuery = 'SELECT post_id FROM posts WHERE post_id = ?';
  connection.query(checkQuery, [postId], (checkErr, checkRes) => {
    if (checkErr) {
      console.log(checkErr);
      return res.status(500).json({ error: 'An error occurred while checking the post' });
    }
    if (checkRes.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const deleteQuery = 'DELETE FROM posts WHERE post_id = ?';

    connection.query(deleteQuery, [postId], (deleteErr, deleteRes) => {
      if (deleteErr) {
        console.log(deleteErr);
        res.status(500).json({ error: 'An error occurred while deleting the post' });
      } else {
        res.status(200).json({ message: 'Post deleted successfully' });
      }
    });
  });
});

export { postRouter };