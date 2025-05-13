const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader); // Debugging log

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token); // Debugging log

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const jwtSecret = "myHardcodedSecretKey"; // Replace with your actual secret
    const decoded = jwt.verify(token, jwtSecret);
    console.log("Decoded Token:", decoded); // Debugging log
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token Verification Error:", err); // Debugging log
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({message: "Token expired." });
    }
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = verifyToken;