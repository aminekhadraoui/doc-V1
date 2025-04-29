import Appointment from '../models/appointmentModel.js';
import Doctor from '../models/doctorModel.js';

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private/Patient
const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, startTime, endTime, reason } = req.body;

    // Validate doctor ID format
    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }

    const doctor = await Doctor.findById(doctorId).populate('user');
    if (!doctor || !doctor.user || !doctor.user.isApproved) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate,
      startTime,
      endTime,
      reason: reason || '',
      status: 'pending',
      paymentStatus: 'pending',
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all appointments for a user
// @route   GET /api/appointments
// @access  Private
// @desc    Get all appointments for a user
// @route   GET /api/appointments
// @access  Private
// @desc    Get all appointments for a user
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patient: req.user._id })
        .populate({
          path: 'doctor',
          select: 'specialty consultation_fee',
          populate: { 
            path: 'user', 
            select: 'name profileImage' 
          }
        })
        .sort({ appointmentDate: -1 });
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      
      if (!doctorProfile) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }

      appointments = await Appointment.find({ doctor: doctorProfile._id })
        .populate({
          path: 'patient',
          select: 'name email profileImage',
          model: 'User'
        })
        .populate({
          path: 'doctor',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name profileImage',
            model: 'User'
          }
        })
        .sort({ appointmentDate: -1 });
    } else {
      appointments = await Appointment.find()
        .populate('patient doctor', 'name email');
    }

    res.json(appointments);
  } catch (error) {
    console.error('Appointment fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name profileImage' }
      })
      .populate('patient', 'name email profileImage');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isAuthorized = req.user.role === 'admin' ||
      appointment.patient._id.equals(req.user._id) ||
      (req.user.role === 'doctor' && appointment.doctor.user._id.equals(req.user._id));

    if (!isAuthorized) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'user');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isPatient = req.user.role === 'patient' && 
      appointment.patient.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'doctor' && 
      appointment.doctor.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Status change validation
    if (req.user.role === 'patient' && status !== 'cancelled') {
      return res.status(403).json({ message: 'Patients can only cancel appointments' });
    }

    if (req.user.role === 'doctor' && !['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(403).json({ message: 'Doctors cannot set status to pending' });
    }

    appointment.status = status;
    const updatedAppointment = await appointment.save();
    
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'user');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isPatient = req.user.role === 'patient' && 
      appointment.patient.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'doctor' && 
      appointment.doctor.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};