import mongoose, { Schema, Document, Model } from 'mongoose'

export type CompanyStatus = 'pending' | 'active' | 'inactive'

export interface CompanyDocument extends Document {
  name: string
  address?: string
  contact?: string
  status: CompanyStatus
  createdByUserId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const companySchema = new Schema<CompanyDocument>(
  {
    name: { type: String, required: true },
    address: { type: String },
    contact: { type: String },
    status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending', index: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
)

export const Company: Model<CompanyDocument> =
  mongoose.models.Company || mongoose.model<CompanyDocument>('Company', companySchema)



