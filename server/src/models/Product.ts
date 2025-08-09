import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ProductDocument extends Document {
  companyId: mongoose.Types.ObjectId
  name: string
  SKU: string
  price: number
  warehouseStock: number
  expiryDate?: Date
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<ProductDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    SKU: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    warehouseStock: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date },
    imageUrl: { type: String },
  },
  { timestamps: true }
)

productSchema.index({ companyId: 1, SKU: 1 }, { unique: true })

export const Product: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>('Product', productSchema)


