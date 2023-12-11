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

// Get users by department name
userRouter.get("/byDepartment/:department_name", (req, res) => {
  const departmentName = req.params.department_name;

  // Step 1: Find the department ID based on the department name
  const findDepartmentIdQuery = 'SELECT department_id FROM departments WHERE department_name = ?';

  connection.query(findDepartmentIdQuery, [departmentName], (findDeptErr, findDeptRes) => {
    if (findDeptErr) {
      console.log(findDeptErr);
      return res.status(500).json({ error: 'An error occurred while finding department ID' });
    }

    if (findDeptRes.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const departmentId = findDeptRes[0].department_id;

    // Step 2: Get users from the users table using the department name
    const getUsersQuery = 'SELECT * FROM users WHERE department = ?';

    connection.query(getUsersQuery, [departmentName], (getUsersErr, getUsersRes) => {
      if (getUsersErr) {
        console.log(getUsersErr);
        return res.status(500).json({ error: 'An error occurred while fetching users by department' });
      }

      res.json(getUsersRes);
    });
  });
});

// Create user
userRouter.post("/", (req, res) => {
  const { first_name, last_name, birthdate, email, phone, street, postal_code, user_type, user_image, department, created_by_id } = req.body;
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

      // Check if the user creating the account has admin rights
      const adminCheckQuery = 'SELECT user_type FROM users WHERE user_id = ?';
      connection.query(adminCheckQuery, [created_by_id], (adminCheckErr, adminCheckRes) => {
        if (adminCheckErr) {
          console.error('Error occurred while checking user_type:', adminCheckErr);
          return res.status(500).json({ error: 'An error occurred while checking user_type' });
        }

        const creatorUserType = adminCheckRes[0]?.user_type;

        // Check if the user creating the account has admin rights
        if (creatorUserType === 'admin') {
          // If the creator has admin rights, proceed to create the new user
          const createQuery = 'INSERT INTO users (first_name, last_name, birthdate, email, phone, street, postal_code, user_type, user_image, department, created_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
          connection.query(createQuery, [first_name, last_name, birthdate, email, phone, street, postal_code, user_type, user_image, department, created_by_id], (createErr, createRes) => {
            if (createErr) {
              console.error('Error occurred while creating the user:', createErr);
              return res.status(500).json({ error: 'An error occurred while creating the user' });
            }
            const newUser = createRes.insertId;
            return res.status(201).json({ user_id: newUser, message: 'User created successfully' });
          });
        } else {
          // If the creator doesn't have admin rights, return a 403 Forbidden response
          console.error('User does not have the necessary permissions to create users');
          return res.status(403).json({ error: 'User does not have the necessary permissions to create users' });
        }
      });
    });
  });
});



// Update user profile
userRouter.put("/:user_id", (req, res) => {
  const { first_name, last_name, birthdate, email, phone, street, postal_code, user_type, user_image, department, updated_by_id } = req.body;
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

    // Check if the user updating the account has admin rights
    const adminCheckQuery = 'SELECT user_type FROM users WHERE user_id = ?';
    connection.query(adminCheckQuery, [updated_by_id], (adminCheckErr, adminCheckRes) => {
      if (adminCheckErr) {
        console.error('Error occurred while checking user_type:', adminCheckErr);
        return res.status(500).json({ error: 'An error occurred while checking user_type' });
      }

      const updaterUserType = adminCheckRes[0]?.user_type;

      // Check if the user updating the account has admin rights
      if (updaterUserType === 'admin') {
        // If the updater has admin rights, proceed with the user profile update
        const updateQuery = 'UPDATE users SET first_name = ?, last_name = ?, birthdate = ?, email = ?, phone = ?, street = ?, postal_code = ?, user_type = ?, user_image = ?, department = ?, updated_by_id = ? WHERE user_id = ?';
        connection.query(updateQuery, [first_name, last_name, birthdate, email, phone, street, postal_code, user_type, user_image, department, updated_by_id, userId], (updateErr, updateRes) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({ error: 'An error occurred while updating the user profile' });
          }
          return res.status(200).json({ user_id: userId, message: 'User profile updated successfully' });
        });
      } else {
        // If the updater doesn't have admin rights, return a 403 Forbidden response
        console.error('User does not have the necessary permissions to update user profiles');
        return res.status(403).json({ error: 'User does not have the necessary permissions to update user profiles' });
      }
    });
  });
});


userRouter.delete("/:user_id/:currentUserId", (req, res) => {
  const userId = req.params.user_id;
  const currentUserId = req.params.currentUserId;

  // Check if the user deleting the account has admin rights
  const adminCheckQuery = 'SELECT user_type FROM users WHERE user_id = ?';
  connection.query(adminCheckQuery, [currentUserId], (adminCheckErr, adminCheckRes) => {
    if (adminCheckErr) {
      console.error('Error occurred while checking user_type:', adminCheckErr);
      return res.status(500).json({ error: 'An error occurred while checking user_type' });
    }

    const currentUserType = adminCheckRes[0]?.user_type;

    // Debugging information
    console.log('User ID:', userId);
    console.log('Current User Type:', currentUserType);

    // Check if the user deleting the account has admin rights
    if (currentUserType === 'admin') {
      // Check the count of users with user_type 'admin'
      const countAdminQuery = 'SELECT COUNT(*) AS adminCount FROM users WHERE user_type = ?';
      connection.query(countAdminQuery, ['admin'], (countAdminErr, countAdminRes) => {
        if (countAdminErr) {
          console.error('Error occurred while counting admin users:', countAdminErr);
          return res.status(500).json({ error: 'An error occurred while counting admin users' });
        }

        const adminCount = countAdminRes[0]?.adminCount || 0;

        // Ensure there is at least one admin user before deletion
        if (adminCount > 1) {
          // If the count is greater than 1, proceed with the user deletion
          const deleteQuery = 'DELETE FROM users WHERE user_id = ?';
          connection.query(deleteQuery, [userId], (deleteErr, deleteRes) => {
            if (deleteErr) {
              console.error(deleteErr);
              res.status(500).json({ error: 'An error occurred while deleting the user' });
            } else {
              res.status(200).json({ message: 'User and related data deleted successfully' });
            }
          });
        } else {
          // If there is only one or no admin users, prevent deletion
          console.error('Cannot delete the last admin user');
          return res.status(403).json({ error: 'Cannot delete the last admin user' });
        }
      });
    } else {
      // If the deleter doesn't have admin rights, return a 403 Forbidden response
      console.error('User does not have the necessary permissions to delete users');
      return res.status(403).json({ error: 'User does not have the necessary permissions to delete users' });
    }
  });
});



export { userRouter };