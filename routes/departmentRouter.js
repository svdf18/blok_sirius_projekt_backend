import { Router } from "express";
import connection from "../db.js";

const departmentRouter = Router();

// Read all departments
departmentRouter.get("/", (req, res) => {
  const query = "SELECT DISTINCT department_name FROM departments";

  connection.query(query, (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for departments' });
    } else {
      res.json(readRes);
    }
  });
});

// Read department by user_id
departmentRouter.get("/user/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const query = 'SELECT d.department_name FROM departments d JOIN users u ON d.user_id = u.user_id WHERE u.user_id = ?';

  connection.query(query, [userId], (readErr, readRes) => {
    if (readErr) {
      console.log(readErr);
      res.status(500).json({ error: 'An error occurred while checking for the department' });
    } else {
      if (readRes.length > 0) {
        res.json({ department_name: readRes[0].department_name });
      } else {
        res.status(404).json({ error: 'Department not found for the specified user_id' });
      }
    }
  });
});


export { departmentRouter };