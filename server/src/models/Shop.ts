import mongoose, { Schema, Document, Model } from 'mongoose'

export type ShopStatus = 'pending' | 'active' | 'inactive'

export interface ShopDocument extends Document {
  name: string
  address?: string
  contact?: string
  createdByUserId: mongoose.Types.ObjectId
  status: ShopStatus
  createdAt: Date
  updatedAt: Date
}

const shopSchema = new Schema<ShopDocument>(
  {
    name: { type: String, required: true, index: true },
    address: { type: String },
    contact: { type: String },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending', index: true },
  },
  { timestamps: true }
)

export const Shop: Model<ShopDocument> =
  mongoose.models.Shop || mongoose.model<ShopDocument>('Shop', shopSchema)


