const db = require("../config/db");
const bcrypt = require("bcrypt");
const { ip, ipv6 } = require("address");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const generateToken = (payload, expiresIn) => {
  // Generate JWT token
  const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
  return token;
};

const signup = async (req, res) => {
  const { firstName, lastName, email, password, userType } = req.body;
  try {
    // Check if email already exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          console.log("Server error about query", err);
          return res
            .status(400)
            .json({ message: "Error occurred during signup" });
        }

        if (result.length > 0) {
          // Email already exists
          return res.status(400).json({ message: "Email already exists" });
        } else {
          // Email doesn't exist, proceed with signup process
          const saltRounds = 10;
          const saltKey = await bcrypt.genSalt(saltRounds);
          const hashedPassword = await bcrypt.hash(password, saltKey);

          const createdAtIP = ip() || ipv6();

          db.query(
            "INSERT INTO users (firstName, lastName, email, password, saltKey, userType, createdAtIP, updatedAtIP) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [firstName, lastName, email, hashedPassword, saltKey, userType, createdAtIP, createdAtIP],
            (err, result) => {
              if (err) {
                console.log("Server error about query", err);
                return res
                  .status(400)
                  .json({ message: "Error occurred during signup" });
              } else {
                const userId = result.insertId;

                // Generate authentication token
                const authToken = generateToken({ id: userId }, "1h");

                // Generate refresh token (optional)
                const refreshToken = generateToken({ id: userId }, "7d"); // Change expiration time as needed

                // Store tokens in cookies
                res.setHeader("Set-Cookie", [
                  cookie.serialize("authToken", authToken, {
                    httpOnly: true,
                    maxAge: 3600, // 1 hour in seconds
                    sameSite: "strict",
                    path: "/",
                  }),
                  cookie.serialize("refreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 604800, // 7 days in seconds
                    sameSite: "strict",
                    path: "/",
                  }),
                ]);

                return res
                  .status(201)
                  .json({ message: "SignUp successful", authToken });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    res.json({ error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    db.query(
      "SELECT * FROM users WHERE email = ? AND deletedAt IS NULL",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Server error about query", err);
          return res.json({ error: "Server Error" });
        }

        if (results.length === 0) {
          // User with provided email doesn't exist
          return res.status(404).json({ message: "Email not found" });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.status(401).json({ error: "Incorrect Password" });
        } 
          const authToken = generateToken(
            { id: user.Id, userId: user.id, userType: user.userType },
            "1h"
          );

          return res
            .status(200)
            .json({
              message: "Login successful",
              Email: user.email,
              authToken,
            });
      }
    );
  } catch (error) {
    res.json({ error });
  }
};

// Get User By ID
const getUserById = (req, res) => {
  try {
    const userId = req.params.id;

    db.query(
      "SELECT id, firstname, lastname, email FROM users WHERE id = ? AND deletedAt IS NULL",
      [userId],
      (err, results) => {
        if (err) {
          console.log("Server error about query", err);
          return res.json({ error: err });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const userData = results[0];
        const response = {
          id: userData.id,
          firstname: userData.firstname,
          lastname: userData.lastname,
          username: userData.username,
          email: userData.email,
        };

        res.json(response);
        console.log("Successfully retrieved user data by ID");
      }
    );
  } catch (error) {
    console.error("Error in getUserById:", error);
    return res.json({ error });
  }
};

// Get All User
const getAllUser = (req, res) => {
  try {
    
    db.query(
      "SELECT id, firstname, lastname, email FROM users WHERE deletedAt IS NULL",
      (err, results) => {
        if (err) {
          console.log("Server error about query", err);
          return res.json({ error: err });
        } 
          const users = results.map((users) => users);
          res.status(200).json(users);
        
      }
    );
  } catch (error) {
    console.error("Error in getAllUser:", error);
    return res.json({ error });
  }
};

// Update User By ID
const updateUserDetail = async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, password } = req.body;
  try {
    db.query(
      "SELECT * FROM users WHERE id = ?",
      [userId],
      async (err, results) => {
        if (err) {
          console.error("Server error about query", err);
          return res.status(400).json({ error: "Server Error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        const existingUser = results[0];
        let hashedPassword = existingUser.password;
        if (password) {
          const saltRounds = 10;
          const saltKey = await bcrypt.genSalt(saltRounds);
          hashedPassword = await bcrypt.hash(password, saltKey);
        }

        let updateFields = [];
        let params = [];

          if (firstName) {
            updateFields.push("firstName = ?");
            params.push(firstName);
          }

        if (lastName) {
          updateFields.push("lastName = ?");
          params.push(lastName);
        }

        if (hashedPassword) {
          updateFields.push("password = ?");
          params.push(hashedPassword);
        }

        if (updateFields.length === 0) {
          return res.status(400).json({ message: "No fields to update" });
      }

        const updatedAtIP = ip() || ipv6();

        params.push(updatedAtIP); // Add updatedAtIP to params
        params.push(userId);

      const updateQuery = `UPDATE users SET ${updateFields.join(', ')}, updatedAtIP = ? WHERE id = ?`;
      db.query(
        updateQuery,
        params,
        (err, result) => {
            if (err) {
                console.error("Server error about query", err);
                return res.status(400).json({ error: "Error occurred during update" });
            }
            // If the update is successful, return success message
            return res.status(200).json({ message: "User updated successfully" });
          }
        );  
      }
    );
  } catch (error) {
    console.error("Error occurred during update", error);
    return res.status(400).json({ error: "Error occurred during update" });
  }
};


// Update Delete By ID
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    db.query(
      "UPDATE users SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?",
      [userId],
      async (err, results) => {
        if (err) {
          console.error("Server error about query", err);
          return res.status(400).json({ error: "Server Error" });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "User not found" });
        } 
        
        res.status(200).json({ message: "User Delete successfully" });
        
      }
    );
  } catch (error) {
    console.error("Error occurred during delete", error);
    return res.status(400).json({ error: "Error occurred during delete" });
  }
};

module.exports = {
  signup,
  login,
  getUserById,
  getAllUser,
  updateUserDetail,
  deleteUser,
};
