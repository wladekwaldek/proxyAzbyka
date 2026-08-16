import { Schema, model, Types } from "mongoose";

const schema = new Schema({
  id: { type: Number, required: true, unique: true },
  chatId: { type: Number },
  name: { type: String, required: true },
  username: { type: String },
  language: { type: String },
  time: { type: Date, default: Date.now },
  is_bot: { type: Boolean },
  notes_time: {
    hours: { type: Number },
    minutes: { type: Number },
  },
  last_login: { type: Date, default: Date.now },
  timezone: { type: String },
  next_reminder_at: { type: Date },
  notifications_enabled: {
    type: Boolean,
    default: false,
  },
});

export default model("User", schema);
