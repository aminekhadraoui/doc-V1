import express from 'express';
import {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctors,
  getDoctorById,
  getSpecialties,
} from '../controllers/doctorController.js';
import { protect, doctor } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getDoctors);
router.get('/specialties', getSpecialties);

// Protected doctor profile routes - must come before :id
router.route('/profile')
  .post(protect, doctor, createDoctorProfile)
  .get(protect, doctor, getDoctorProfile)
  .put(protect, doctor, updateDoctorProfile);

// Public doctor details route - keep this last
router.get('/:id', getDoctorById);

export default router;