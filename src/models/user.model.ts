import mongoose, { Schema, Document } from "mongoose";

// Define the Message interface and schema
export interface Message {
  _id?: string;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<Message>({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Define the User interface and schema
interface User extends Document {
  username: string;
  email: string;
  password?: string;
  verifyCode?: string;
  verifyCodeExpiry?: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
  googleId?: string;
}

const UserSchema = new Schema<User>({
  username: {
    type: String,
    required: [true, "Username is required!"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
    match: [
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
      "Please fill a valid email address!",
    ],
  },
  password: {
    type: String,
  },
  verifyCode: {
    type: String,
    default: "",
  },
  verifyCodeExpiry: {
    type: Date,
    default: new Date(0),
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
  googleId: {
    type: String,
  },
});

// Export the User model
const UserModel =
  (mongoose.models?.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;



