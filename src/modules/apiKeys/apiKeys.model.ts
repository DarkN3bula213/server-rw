import { InferSchemaType, model, Schema } from 'mongoose';
import { ApiKey } from './apiKeys.interface';

const apiKeySchema = new Schema<ApiKey>(
  {
    key: { type: String, required: true },
    permissions: { type: [String], required: true, enum: ['GENERAL', 'ADMIN', 'SUPER_ADMIN'] },
    comments: { type: [String], required: true },
    version: { type: Number, required: true },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
    statics: {
      async findByKey(key: string): Promise<ApiKey | null> {
        return this.findOne({ key, status: true });
      },
    },
  }
);

type ApiKeyModel = InferSchemaType<typeof apiKeySchema>;
const ApiKeyModel = model<ApiKeyModel>('ApiKey', apiKeySchema, 'api_keys');

export default ApiKeyModel;
