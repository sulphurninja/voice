import mongoose, { Document, Schema } from 'mongoose';

export interface IAgent extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  agentId: string; // ElevenLabs agent ID
  voiceId: string;
  voiceName: string;
  disabled: boolean;
  firstMessage: string;
  systemPrompt: string;
  usageMinutes: number;
  lastCalledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    agentId: {
      type: String,
      required: true,
    },
    voiceId: {
      type: String,
      required: true,
    },
    voiceName: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    firstMessage: {
      type: String,
      required: true,
    },
    systemPrompt: {
      type: String,
      required: true,
    },
    usageMinutes: {
      type: Number,
      default: 0,
    },
    lastCalledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Agent = mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);

export default Agent;
