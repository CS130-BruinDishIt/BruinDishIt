import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Malformed token" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user info to request
        req.user = {
            id: decoded.userId,
            username: decoded.username
        };

        next();

    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}