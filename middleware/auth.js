import jwt from 'jsonwebtoken'

const authenticateToken = (res, req, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split('')[1]; // Bearer
    if (!token) return res.status(401).json({ success: false, message: 'No token provided', error: 'auth_error' });

    jwt.verify(token, process.env.JWT_SECRET,(err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token', error: 'auth_error' });
        req.user = decoded;
        next();
    });
};

export default authenticateToken