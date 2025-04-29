import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
    },
    profileImage: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: function() {
        return this.role === 'patient'; // Automatically approve patients
      }
    }
  },
  {
    timestamps: true,
  }
);

// Password matching method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;