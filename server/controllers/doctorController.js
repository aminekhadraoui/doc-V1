import Doctor from '../models/doctorModel.js';
import User from '../models/userModel.js';

// @desc    Create doctor profile
// @route   POST /api/doctors
// @access  Private/Doctor
const createDoctorProfile = async (req, res) => {
  try {
    const { specialty, bio, experience, consultation_fee, availability } = req.body;

    // Check if profile already exists
    const existingProfile = await Doctor.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    const doctorProfile = await Doctor.create({
      user: req.user._id,
      specialty,
      bio: bio || '',
      experience: experience || 0,
      consultation_fee: consultation_fee || 0,
      availability: availability || [],
    });

    if (doctorProfile) {
      res.status(201).json(doctorProfile);
    } else {
      res.status(400).json({ message: 'Invalid doctor data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor profile
// @route   GET /api/doctors/profile
// @access  Private/Doctor
// @desc    Get doctor profile
// @route   GET /api/doctors/profile
// @access  Private/Doctor
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', 'name email profileImage');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.set('Cache-Control', 'no-store');
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private/Doctor
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (doctor) {
      doctor.specialty = req.body.specialty || doctor.specialty;
      doctor.bio = req.body.bio || doctor.bio;
      doctor.experience = req.body.experience || doctor.experience;
      doctor.consultation_fee = req.body.consultation_fee || doctor.consultation_fee;
      
      if (req.body.availability) {
        doctor.availability = req.body.availability;
      }

      const updatedDoctor = await doctor.save();
      res.json(updatedDoctor);
    } else {
      res.status(404).json({ message: 'Doctor profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const specialty = req.query.specialty;
    const filter = specialty ? { specialty } : {};

    // Only get approved doctors
    const doctors = await Doctor.find(filter)
      .populate({
        path: 'user',
        match: { isApproved: true },
        select: 'name email profileImage',
      })
      .sort({ ratings: -1 });

    // Filter out doctors whose user is null (not approved)
    const approvedDoctors = doctors.filter(doctor => doctor.user !== null);

    res.json(approvedDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email profileImage isApproved');

    // Check if doctor exists, has a valid user, and is approved
    if (doctor && doctor.user && doctor.user.isApproved) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all specialties
// @route   GET /api/doctors/specialties
// @access  Public
const getSpecialties = async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty');
    res.json(specialties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctors,
  getDoctorById,
  getSpecialties,
};