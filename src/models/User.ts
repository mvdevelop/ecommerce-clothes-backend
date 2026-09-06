import mongoose, { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  cartData: Record<string, number>;
  wishlist: Types.ObjectId[];
  refreshToken?: string;
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getSignedRefreshToken(): string;
  getResetPasswordToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide user name"],
      trim: true,
      maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide user email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,}$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide user password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"] satisfies UserRole[],
      default: "user",
    },
    cartData: {
      type: Object as Schema.Types.Mixed,
      default: {},
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    refreshToken: {
      type: String,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in DB
userSchema.methods.matchPassword = async function (
  this: IUser,
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function (this: IUser): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"],
  };
  return jwt.sign({ id: this._id.toString() }, process.env.JWT_SECRET as string, options);
};

userSchema.methods.getSignedRefreshToken = function (this: IUser): string {
  const options: SignOptions = {
    expiresIn: (process.env.REFRESH_EXPIRES_IN || "30d") as SignOptions["expiresIn"],
  };
  return jwt.sign({ id: this._id.toString() }, process.env.REFRESH_SECRET as string, options);
};

userSchema.methods.getResetPasswordToken = function (this: IUser): string {
  const resetToken = jwt.sign(
    { id: this._id.toString() },
    process.env.JWT_SECRET as string,
    { expiresIn: "10m" }
  );

  this.resetPasswordToken = resetToken;
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

const User = model<IUser>("User", userSchema);
export default User;