import mongoose, { Schema, Document, Model } from 'mongoose'

export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'SHOP_OWNER'

export interface UserDocument extends Document {
  email: string
  passwordHash: string
  role: UserRole
  linkedCompanyId?: mongoose.Types.ObjectId
  linkedShopId?: mongoose.Types.ObjectId
  shopStatus?: 'pending' | 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'SHOP_OWNER'],
      required: true,
      index: true,
    },
    linkedCompanyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    linkedShopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    shopStatus: { type: String, enum: ['pending', 'active', 'inactive'], index: true },
  },
  { timestamps: true }
)

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', userSchema)



