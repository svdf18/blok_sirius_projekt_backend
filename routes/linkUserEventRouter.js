import { Router } from 'express';
import connection from '../db.js';

const linkUserToEventRouter = Router();

linkUserToEventRouter.post('/check-invitation', (req, res) => {
  const { userId, eventId } = req.body;

  try {
    // Query event_departments to check if the event is associated with any department
    connection.query('SELECT * FROM event_departments WHERE event_id = ?', [eventId], (eventDepartmentsError, eventDepartmentsResults) => {
      if (eventDepartmentsError) {
        console.error('Error checking invitation (event_departments):', eventDepartmentsError);
        return res.status(500).json({ error: 'An error occurred while checking invitation status' });
      }

      console.log('eventDepartmentsResults:', eventDepartmentsResults);

      // Check if any department is associated with the event
      if (eventDepartmentsResults.length > 0) {
        // Check if the user belongs to any of the associated departments
        connection.query('SELECT department_id FROM user_departments WHERE user_id = ?', [userId], (userDepartmentsError, userDepartmentsResults) => {
          if (userDepartmentsError) {
            console.error('Error checking invitation (user_departments):', userDepartmentsError);
            return res.status(500).json({ error: 'An error occurred while checking invitation status' });
          }

          console.log('userDepartmentsResults:', userDepartmentsResults);

          // Check if there's an intersection between event departments and user departments
          const isInvited = eventDepartmentsResults.some(eventDepartment => 
            userDepartmentsResults.some(userDepartment => userDepartment.department_id === eventDepartment.department_id));

          if (isInvited) {
            console.log(`User ${userId} is invited to event ${eventId}`);
            return res.status(200).json({ isInvited: true, message: 'User is invited to the event' });
          } else {
            console.log(`User ${userId} is not invited to event ${eventId}`);
            return res.status(200).json({ isInvited: false, message: 'User is not invited to the event' });
          }
        });
      } else {
        // No department associated with the event
        console.log(`Event ${eventId} is not associated with any department`);
        return res.status(200).json({ isInvited: false, message: 'Event is not associated with any department' });
      }
    });
  } catch (error) {
    console.error('Error checking invitation:', error);
    return res.status(500).json({ error: 'An error occurred while checking invitation status' });
  }
});


linkUserToEventRouter.post('/mark-attendance', (req, res) => {
  const { userId, eventId } = req.body;

  const attendQuery = 'INSERT INTO user_events (user_id, event_id) VALUES (?, ?)';

  connection.query(attendQuery, [userId, eventId], (attendErr) => {
    if (attendErr) {
      console.error(`Error marking attendance for user ${userId} at event ${eventId}:`, attendErr);
      res.status(500).json({ error: 'An error occurred while marking attendance' });
    } else {
      console.log(`User ${userId} marked as attended for event ${eventId}`);
      res.status(200).json({ message: 'Attendance marked successfully' });
    }
  });
});


export { linkUserToEventRouter };
