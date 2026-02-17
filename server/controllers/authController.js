import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import generateToken from '../utils/generateToken.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { name, email, password, role, phone, specialization, qualification, licenseNumber, experience, consultationFee } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'User already exists with this email');
    }

    // Create user
    const user = await User.create({ name, email, password, role, phone });

    // Create role-specific profile
    if (role === 'patient') {
      await Patient.create({ userId: user._id });
    } else if (role === 'doctor') {
      if (!specialization || !qualification || !licenseNumber) {
        await User.findByIdAndDelete(user._id);
        return sendError(res, 400, 'Doctor registration requires specialization, qualification, and licenseNumber');
      }
      await Doctor.create({
        userId: user._id,
        specialization,
        qualification,
        licenseNumber,
        experience: experience || 0,
        consultationFee: consultationFee || 0,
      });
    }

    const token = generateToken(user._id, user.role);

    sendResponse(res, 201, 'Registration successful', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id, user.role);

    sendResponse(res, 200, 'Login successful', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id });
    }

    sendResponse(res, 200, 'User profile', {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    sendResponse(res, 200, 'Profile updated', {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};
