import mongoose from 'mongoose';

const availabilitySlotSchema = mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

const doctorSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    specialty: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    experience: {
      type: Number,
      default: 0,
    },
    consultation_fee: {
      type: Number,
      default: 0,
    },
    availability: [availabilitySlotSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;