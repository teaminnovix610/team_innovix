import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import env from "../config/env.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address",
      },
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (value) => validator.isMobilePhone(value, "en-IN"),
        message: "Invalid Indian mobile number",
      },
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "TRAINEE",
        "TRAINER",
        "ADMIN",
        "STUDENT",
        "TEACHER",
        "PARENT"
      ],
      default: "TRAINEE"
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    organization: {
      type: String,
      default: "Ministry of Earth Sciences (MoES)",
    },
    bio: {
      type: String,
      default: "",
    },
    qualifications: [
      {
        degree: String,
        field: String,
        institution: String,
        year: String,
      }
    ],
    workExperience: [
      {
        organization: String,
        designation: String,
        domain: String,
        years: Number,
        current: { type: Boolean, default: false },
      }
    ],
    interests: [{ type: String }],
    skills: [{ type: String }],
    subjects: [{ type: String }],
    competencies: [
      {
        name: { type: String, required: true },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          default: "Advanced",
        },
      },
    ],
    certificates: [
      {
        title: String,
        issuer: String,
        issueDate: String,
        certificateUrl: String,
        credentialId: String,
      }
    ],
    avatar: {
      type: String,
      default: null,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    accountLockedUntil: {
      type: Date,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    refreshTokens: {
      type: [
        {
          tokenHash: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          expiresAt: { type: Date, required: true },
        },
      ],
      default: [],
      select: false,
    },

    lastLogin: Date,

    passwordResetOtp: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetOtpExpiry: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.virtual("fullName").get(function () {
    return [this.firstName, this.lastName].filter(Boolean).join(" ");
});

const User = mongoose.model("User", userSchema);

export default User;