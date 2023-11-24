import { Router } from "express";
import connection from "../db.js";

const departmentRouter = Router();


// Read all departments
departmentRouter.get("/", (req, res) => {
  const query = "SELECT * FROM departments";

    connection.query(query, (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for user preferences' });
    } else {
      res.json(readRes);
    }
  });
});

// Read department by user_id
departmentRouter.get("/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const query = 'SELECT * FROM departments WHERE user_id = ?';
  
  connection.query(query, [userId], (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for departments' }); 
    } else {
      if (readRes.length > 0) {
        res.json(readRes[0]);
      } else {
        res.status(404).json({ error: 'Departments not found' });
      }
    }
  });
});


// Create department
departmentRouter.post('/', (req, res) => {
  const { department_name, user_id } = req.body;

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

    const insertQuery = 'INSERT INTO departments (department_name, user_id) VALUES (?, ?)';
    connection.query(insertQuery, [department_name, user_id], (insertErr, result) => {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ error: 'An error occurred while saving department' });
      }

      // Return a success response
      return res.status(201).json({ message: 'Department saved successfully' });
    });
  });
});

// Update user profile
departmentRouter.put("/:department_id", (req, res) => {
  const { department_name, user_id } = req.body;
  const depId = req.params.user_id;
  
  const updateQuery = 'UPDATE departments SET department_name = ?, user_id = ? WHERE department_id = ?';
  connection.query(updateQuery, [department_name, user_id, depId], (updateErr, updateRes) => {
    if (updateErr) {
      console.error(updateErr);
      return res.status(500).json({ error: 'An error occurred while updating the department' });
    }
    return res.status(200).json({ user_id: depId, message: 'Department profile updated successfully' });
  });

});


export { departmentRouter };