import { SECRET_KEY, REFRESH_SECRET_KEY } from "../config.js";
import jwt from "jsonwebtoken";
const options = {};
export const verifyAccesskey = async (req, res, next) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) {
    return res.status(403).json({ error: "Authorization headers required" });
  }
  // Get Access token from auth headers using Bearer 'token' format
  const access = authHeaders.split(" ")[1];
  if (!access) {
    return res.status(403).json({ error: "access token required" });
  }
  jwt.verify(access, SECRET_KEY, options, (err, decode) => {
    if (err) {
      return res.status(403).json({ error: err });
    } else {
      req.user = { id: decode.id, username: decode.username };
      next();
    }
  });
};
