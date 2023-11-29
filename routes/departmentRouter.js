import { Router } from "express";
import connection from "../db.js";

const departmentRouter = Router();

// Read all departments
departmentRouter.get("/", (req, res) => {
  const query = "SELECT * FROM departments";

  connection.query(query, (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for departments' });
    } else {
      res.json(readRes);
    }
  });
});

// Read department by department_id
departmentRouter.get("/:department_id", (req, res) => {
  const departmentId = req.params.department_id;
  const query = 'SELECT * FROM departments WHERE department_id = ?';

  connection.query(query, [departmentId], (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for the department' });
    } else {
      if (readRes.length > 0) {
        res.json(readRes[0]);
      } else {
        res.status(404).json({ error: 'Department not found' });
      }
    }
  });
});

// Create department
departmentRouter.post("/", (req, res) => {
  const { department_name, user_id } = req.body;

  const createQuery = 'INSERT INTO departments (department_name, user_id) VALUES (?, ?)';
  connection.query(createQuery, [department_name, user_id], (createErr, createRes) => {
    if (createErr) {
      console.error('Error occurred while creating the department:', createErr);
      return res.status(500).json({ error: 'An error occurred while creating the department' });
    }
    const newDepartmentId = createRes.insertId;
    return res.status(201).json({ department_id: newDepartmentId, message: 'Department created successfully' });
  });
});

// Update department
departmentRouter.put("/:department_id", (req, res) => {
  const { department_name, user_id } = req.body;
  const departmentId = req.params.department_id;

  const updateQuery = 'UPDATE departments SET department_name = ?, user_id = ? WHERE department_id = ?';
  connection.query(updateQuery, [department_name, user_id, departmentId], (updateErr, updateRes) => {
    if (updateErr) {
      console.error(updateErr);
      return res.status(500).json({ error: 'An error occurred while updating the department' });
    }
    return res.status(200).json({ department_id: departmentId, message: 'Department updated successfully' });
  });
});

// Delete a department by department_id
departmentRouter.delete("/:department_id", (req, res) => {
  const departmentId = req.params.department_id;

  const checkQuery = 'SELECT department_id FROM departments WHERE department_id = ?';
  connection.query(checkQuery, [departmentId], (checkErr, checkRes) => {
    if (checkErr) {
      console.log(checkErr);
      return res.status(500).json({ error: 'An error occurred while checking the department' });
    }
    if (checkRes.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const deleteQuery = 'DELETE FROM departments WHERE department_id = ?';

    connection.query(deleteQuery, [departmentId], (deleteErr, deleteRes) => {
      if (deleteErr) {
        console.log(deleteErr);
        res.status(500).json({ error: 'An error occurred while deleting the department' });
      } else {
        res.status(200).json({ message: 'Department deleted successfully' });
      }
    });
  });
});

export { departmentRouter };