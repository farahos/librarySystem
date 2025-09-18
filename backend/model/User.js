import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userschema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // password laguma soo celin doono queries default
    },
    // ✅ Field cusub oo u maamula role-ka
    role: {
      type: String,
      enum: ["admin", "user"], // kaliya labada door ee la ogol yahay
      default: "user",         // user waa default
    },
  },
  {
    timestamps: true,
  }
);

// Hash password ka hor save
userschema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method lagu hubiyo password sax ah
userschema.methods.comparePassword = async function (givenPassword) {
  return await bcrypt.compare(givenPassword, this.password);
};

const User = mongoose.model("User", userschema);
export default User;
