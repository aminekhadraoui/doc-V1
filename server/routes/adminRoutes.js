import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllDoctors,
  approveDoctor,
  getAllAppointments,
  getDashboardStats,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/users', getUsers);
router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.get('/doctors', getAllDoctors);
router.put('/doctors/:id/approve', approveDoctor);

router.get('/appointments', getAllAppointments);
router.get('/dashboard', getDashboardStats);

export default router;