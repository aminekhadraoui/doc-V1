import User from '../models/userModel.js';
import Doctor from '../models/doctorModel.js';
import Appointment from '../models/appointmentModel.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : user.isApproved;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Delete doctor profile if it exists
      if (user.role === 'doctor') {
        await Doctor.deleteOne({ user: user._id });
      }

      // Delete appointments for this user
      if (user.role === 'patient') {
        await Appointment.deleteMany({ patient: user._id });
      }

      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all doctors for admin
// @route   GET /api/admin/doctors
// @access  Private/Admin
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate('user', 'name email isApproved');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve doctor
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private/Admin
const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user');

    if (doctor) {
      const user = await User.findById(doctor.user._id);
      
      if (user) {
        user.isApproved = true;
        await user.save();
        res.json({ message: 'Doctor approved' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all appointments for admin
// @route   GET /api/admin/appointments
// @access  Private/Admin
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate({
        path: 'doctor',
        select: 'specialty',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate('patient', 'name email');
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const pendingApprovals = await User.countDocuments({ role: 'doctor', isApproved: false });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Get recent appointments
    const recentAppointments = await Appointment.find({})
      .populate({
        path: 'doctor',
        select: 'specialty',
        populate: {
          path: 'user',
          select: 'name',
        },
      })
      .populate('patient', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent users
    const recentUsers = await User.find({})
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalDoctors,
      pendingApprovals,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      recentAppointments,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllDoctors,
  approveDoctor,
  getAllAppointments,
  getDashboardStats,
};