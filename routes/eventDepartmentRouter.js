import { Router } from "express";
import connection from "../db.js";

const eventDepartmentRouter = Router();

// Get departments for a specific event
eventDepartmentRouter.get('/:eventId', (req, res) => {
  const { eventId } = req.params;

  const selectQuery = 'SELECT department_name FROM event_departments INNER JOIN departments ON event_departments.department_id = departments.department_id WHERE event_departments.event_id = ?';

  connection.query(selectQuery, [eventId], (error, results) => {
    if (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ error: 'An error occurred while processing the request' });
      return;
    }

    const departments = results.map((result) => result.department_name);
    res.status(200).json(departments);
  });
});

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
