import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .send({ succes: false, message: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id,
      isAdmin: decoded.isAdmin || false,
    };
    next();
  } catch (error) {
    res.status(401).send({ message: "Token is not valid" });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.isAdmin)) {
      return res.status(403).send({
        message: "You don't have permission to perform to do this operation!",
      });
    }
    next();
  };
};
