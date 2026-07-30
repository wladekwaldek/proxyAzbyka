import { Schema, model, Types } from "mongoose";

const schema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String },
  language: { type: String },
  time: { type: Date, default: Date.now },
  is_bot: { type: Boolean },
  notes_time: {
    houres: { type: Number },
    minutes: { type: Number },
  },
  last_login: { type: Date, default: Date.now },
});

export default model("User", schema);
