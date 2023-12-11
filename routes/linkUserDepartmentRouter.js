import { Router } from 'express';
import connection from '../db.js';

const linkUserToDepartmentRouter = Router();

linkUserToDepartmentRouter.post('/', (req, res) => {
  const { userId, departmentName } = req.body;

  const linkQuery = 'INSERT INTO user_departments (user_id, department_id) VALUES (?, (SELECT department_id FROM departments WHERE department_name = ?))';

  connection.query(linkQuery, [userId, departmentName], (linkErr) => {
    if (linkErr) {
      console.error(`Error linking user ${userId} to department ${departmentName}:`, linkErr);
      res.status(500).json({ error: 'An error occurred while linking user to department' });
    } else {
      console.log(`User ${userId} linked to department ${departmentName} successfully`);
      res.status(200).json({ message: 'User linked to department successfully' });
    }
  });
});

export { linkUserToDepartmentRouter };
