import { Router } from "express";
import connection from "../db.js";
import { promisify } from 'util';

const eventDepartmentRouter = Router();

eventDepartmentRouter.post("/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const { departments } = req.body;

  console.log('Received departments:', departments);
  const insertQuery = 'INSERT INTO event_departments (event_id, department_id) VALUES (?, ?)';

  // Start a transaction
  try {
    await promisify(connection.beginTransaction.bind(connection))();

    // Use Promise.all to parallelize database inserts
    await Promise.all(departments.map(async (departmentId) => {
      await promisify(connection.query.bind(connection))(insertQuery, [eventId, departmentId]);
    }));

    // Commit the transaction
    await promisify(connection.commit.bind(connection))();

    res.status(200).json({ message: 'Departments inserted successfully' });
  } catch (error) {
    // Rollback the transaction in case of an error
    await promisify(connection.rollback.bind(connection))();
    console.error('Transaction rolled back due to error:', error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

export {eventDepartmentRouter}
