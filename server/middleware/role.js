import { sendError } from '../utils/apiResponse.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `Role '${req.user.role}' is not authorized to access this route`);
    }
    next();
  };
};
