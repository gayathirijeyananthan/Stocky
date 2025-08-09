import mongoose, { Schema, Document, Model } from 'mongoose'

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'delivered'

export interface OrderItem {
  productId: mongoose.Types.ObjectId
  name: string
  SKU?: string
  price: number
  quantity: number
}

export interface OrderDocument extends Document {
  companyId: mongoose.Types.ObjectId
  shopOwnerUserId: mongoose.Types.ObjectId
  items: OrderItem[]
  status: OrderStatus
  address: string
  contact?: string
  date?: Date
  time?: string
  latitude?: number
  longitude?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema = new Schema<OrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  SKU: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false })

const orderSchema = new Schema<OrderDocument>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  shopOwnerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  status: { type: String, enum: ['pending','accepted','rejected','delivered'], default: 'pending', index: true },
  address: { type: String, required: true },
  contact: { type: String },
  date: { type: Date },
  time: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  notes: { type: String },
}, { timestamps: true })

export const Order: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>('Order', orderSchema)


