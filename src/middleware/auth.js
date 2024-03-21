const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Extract token from the request headers
  const token = req.headers.authorization;
  
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify the token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token" });
    }

    // If token is valid, attach decoded information to the request object
    req.userId = decoded.id; // You can attach additional information to the request object if needed
    next();
  });
};

const authenticateUser = (req, res, next) => {
  // Extract token from the request headers
  const token = req.headers.authorization;

  // Check if token exists
  if (!token) {
      return res.status(401).json({ message: "No token provided" });
  }

  // Verify the token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
          return res.status(403).json({ message: "Failed to authenticate token" });
      }

      // Check user type from decoded token
      const userType = decoded.userType;

      // Check if user type is allowed to access the route
      if (userType !== '0') {
          return res.status(403).json({ message: "Unauthorized access" });
      }

      // If user type is allowed, proceed to the next middleware/route handler
      req.userId = decoded.id; // You can attach additional information to the request object if needed
      next();
  });
};

module.exports = {
  verifyToken,
  authenticateUser,
};
