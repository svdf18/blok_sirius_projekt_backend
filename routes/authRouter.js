// authRoutes.js
import { Router } from "express";
import connection from "../db.js";

const authRouter = Router();

// Set user email in the backend
authRouter.post("/setUserEmail", (req, res) => {
  const { email } = req.body;

  // Here, you can store the email in the database or use it for other purposes
  // Example: Store the email in a session or create a user profile

  // Fetch user data from the MySQL database based on the provided email
  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(getUserQuery, [email], (err, result) => {
    if (err) {
      console.error('Error fetching user data from MySQL:', err);
      return res.status(500).json({ error: 'An error occurred while fetching user data' });
    }

    if (result.length > 0) {
      const userData = result[0];
      console.log('User data retrieved from MySQL:', userData);
      res.json({ message: 'User email received in the backend', email, user: userData });
    } else {
      console.log('User not found in MySQL for email:', email);
      res.status(404).json({ error: 'User not found in MySQL' });
    }
  });
});

export { authRouter };
