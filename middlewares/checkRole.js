// Middleware to check user roles
const checkRole = (roles) => {
    return (req, res, next) => {
      const userRole = res.locals.userRole;
      if (!roles.includes(userRole)) {
        return res.status(403).json("Access denied: insufficient permissions");
      }
      next();
    };
  };
  
  module.exports = checkRole;
  