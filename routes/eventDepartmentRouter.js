import { Router } from "express";
import connection from "../db.js";

const eventDepartmentRouter = Router();

// eventDepartmentRouter.post
eventDepartmentRouter.post("/:eventId", (req, res) => {
  const { eventId } = req.params;
  const { departments } = req.body;

  console.log('Received departments:', departments);
  const insertQuery = 'INSERT INTO event_departments (event_id, department_id) VALUES (?, ?)';

  // Use forEach to iterate through departments and perform sequential database inserts
  departments.forEach((departmentId, index, array) => {
    connection.query(insertQuery, [eventId, departmentId], (error, results) => {
      if (error) {
        console.error('Error inserting department:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
      }

      // If it's the last iteration, send the success response
      if (index === array.length - 1) {
        res.status(200).json({ message: 'Departments inserted successfully' });
      }
    });
  });
});

export { eventDepartmentRouter };
