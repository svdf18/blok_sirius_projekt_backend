import { Router } from "express";
import connection from "../db.js";

const userRouter = Router();


// Read all users
userRouter.get("/", (req, res) => {
  const query = "SELECT * FROM users";

    connection.query(query, (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for users' });
    } else {
      res.json(readRes);
    }
  });
});

// Read user by id
userRouter.get("/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const query = 'SELECT * FROM users WHERE user_id = ?';
  
  connection.query(query, [userId], (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for user' }); 
    } else {
      if (readRes.length > 0) {
        res.json(readRes[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  });
});

// Create user
userRouter.post("/", (req, res) => {
  const { first_name, last_name, birthdate, email, phone, street, postal_code, user_preferences, user_type, user_image } = req.body;
  const checkEmailQuery = 'SELECT user_id FROM users WHERE email = ?';
  const checkPhoneQuery = 'SELECT user_id FROM users WHERE phone = ?';

  // Check if the email and phone number already exist
  connection.query(checkEmailQuery, [email], (emailErr, emailResult) => {
    connection.query(checkPhoneQuery, [phone], (phoneErr, phoneResult) => {
      if (emailErr || phoneErr) {
        console.error('Error occurred while checking email or phone number:', emailErr || phoneErr);
        return res.status(500).json({ error: 'An error occurred while checking email or phone number' });
      }
      if (emailResult.length > 0 && phoneResult.length > 0) {
        return res.status(400).json({ error: 'Email and phone number already exist' });
      }
      if (emailResult.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      if (phoneResult.length > 0) {
        return res.status(400).json({ error: 'Phone number already exists' });
      }

      // If neither is present - create the new user
      const createQuery = 'INSERT INTO users (first_name, last_name, birthdate, email, phone, street, postal_code, user_preferences, user_type, user_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      connection.query(createQuery, [first_name, last_name, birthdate, email, phone, street, postal_code, user_preferences, user_type, user_image], (createErr, createRes) => {
        if (createErr) {
          console.error('Error occurred while creating the user:', createErr);
          return res.status(500).json({ error: 'An error occurred while creating the user' });
        }
        const newUser = createRes.insertId;
        return res.status(201).json({ user_id: newUser, message: 'User created successfully' });
      });
    });
  });
});

// Update user profile
userRouter.put("/:user_id", (req, res) => {
  const { first_name, last_name, birthdate, email, phone, street, postal_code, user_preferences, user_type, user_image } = req.body;
  const userId = req.params.user_id;
  
  // Check for uniqueness of email and phone
  const checkUniqueQuery = 'SELECT user_id FROM users WHERE (email = ? OR phone = ?) AND user_id != ?';
  connection.query(checkUniqueQuery, [email, phone, userId], (uniqueErr, uniqueResults) => {
    if (uniqueErr) {
      console.error(uniqueErr);
      return res.status(500).json({ error: 'An error occurred while checking uniqueness' });
    }
    if (uniqueResults.length > 0) {
      return res.status(400).json({ error: 'Email or phone number is already in use by another user' });
    }

    // Update user profile in the database
    const updateQuery = 'UPDATE users SET first_name = ?, last_name = ?, birthdate = ?, email = ?, phone = ?, street = ?, postal_code = ?, user_preferences = ?, user_type = ?, user_image = ? WHERE user_id = ?';
    connection.query(updateQuery, [first_name, last_name, birthdate, email, phone, street, postal_code, user_preferences, user_type, user_image, userId], (updateErr, updateRes) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({ error: 'An error occurred while updating the user profile' });
      }
      return res.status(200).json({ user_id: userId, message: 'User profile updated successfully' });
    });
  });
});

// Delete a user by user_id
userRouter.delete("/:user_id", (req, res) => {
  const userId = req.params.user_id;

  const checkQuery = 'SELECT user_id FROM users WHERE user_id = ?';
  connection.query(checkQuery, [userId], (checkErr, checkRes) => {
    if (checkErr) {
      console.log(checkErr);
      return res.status(500).json({ error: 'An error occurred while checking the user' });
    }
    if (checkRes.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

      const deleteQuery = 'DELETE FROM users WHERE user_id = ?';

      connection.query(deleteQuery, [userId], (deleteErr, deleteRes) => {
        if (deleteErr) {
          console.log(deleteErr);
          res.status(500).json({ error: 'An error occurred while deleting the user' });
        } else {
          res.status(200).json({ message: 'User and related data deleted successfully' });
        }
      });
      
  });
});


export { userRouter };