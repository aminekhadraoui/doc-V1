import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createAppointment)
  .get(protect, getAppointments);

router.route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, updateAppointmentStatus)
  .delete(protect, cancelAppointment);

export default router;