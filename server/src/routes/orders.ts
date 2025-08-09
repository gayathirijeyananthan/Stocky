import { Router, Request, Response } from 'express'
import { requireAuth, requireRoles } from '../middlewares/auth'
import { Order } from '../models/Order'
import { Product } from '../models/Product'
import { Company } from '../models/Company'
import mongoose from 'mongoose'
import { User } from '../models/User'
import { sendMail } from '../utils/mailer'

const router = Router()

// POST /api/v1/orders - create order (Shop Owner)
router.post('/', requireAuth, requireRoles('SHOP_OWNER'), async (req: Request, res: Response) => {
  try {
    const { companyId, items, address, contact, date, time, latitude, longitude, notes } = req.body as {
      companyId?: string
      items?: Array<{ productId?: string; name?: string; SKU?: string; price?: number; quantity?: number }>
      address?: string
      contact?: string
      date?: string
      time?: string
      latitude?: number
      longitude?: number
      notes?: string
    }
    if (!companyId || !mongoose.isValidObjectId(companyId)) return res.status(400).json({ message: 'companyId required' })
    if (!address) return res.status(400).json({ message: 'address required' })
    if (!items || items.length === 0) return res.status(400).json({ message: 'items required' })
    const company = await Company.findOne({ _id: companyId, status: 'active' })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    // sanitize items (optional: validate existance)
    const normalized = await Promise.all(items.map(async (it) => {
      if (!it.productId || !mongoose.isValidObjectId(it.productId) || !it.quantity || it.quantity < 1) {
        throw new Error('invalid items')
      }
      const product = await Product.findById(it.productId)
      if (!product || String(product.companyId) !== String(company._id)) throw new Error('invalid items')
      return {
        productId: product._id,
        name: product.name,
        SKU: product.SKU,
        price: product.price,
        quantity: it.quantity,
      }
    }))
    const order = await Order.create({
      companyId: company._id,
      shopOwnerUserId: new mongoose.Types.ObjectId(req.user!.sub),
      items: normalized,
      address,
      contact,
      date: date ? new Date(date) : undefined,
      time,
      latitude,
      longitude,
      notes,
    })
    // Notify shop owner via email (best-effort)
    try {
      const user = await User.findById(req.user!.sub)
      if (user?.email) {
        await sendMail({
          to: user.email,
          subject: 'Your order has been placed',
          text: `Your order (${order._id}) has been placed successfully. You will receive updates by email.`,
        })
      }
    } catch (e) {
      console.warn('Failed to send order email:', e)
    }
    return res.status(201).json({ orderId: order._id })
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || 'Failed to create order' })
  }
})

// GET /api/v1/orders - list orders for current company (Company Admin)
router.get('/', requireAuth, requireRoles('COMPANY_ADMIN'), async (req: Request, res: Response) => {
  try {
    const company = await Company.findOne({ createdByUserId: req.user!.sub })
    if (!company) return res.json({ orders: [] })
    const orders = await Order.find({ companyId: company._id })
      .sort({ createdAt: -1 })
      .lean()
    return res.json({ orders })
  } catch {
    return res.status(500).json({ message: 'Failed to list orders' })
  }
})

// GET /api/v1/orders/mine - list orders created by current shop owner (Shop Owner)
router.get('/mine', requireAuth, requireRoles('SHOP_OWNER'), async (req: Request, res: Response) => {
  try {
    const docs = await Order.find({ shopOwnerUserId: req.user!.sub })
      .populate('companyId', 'name address contact')
      .sort({ createdAt: -1 })
      .lean()
    const orders = docs.map((o: any) => ({
      _id: o._id,
      status: o.status,
      address: o.address,
      contact: o.contact,
      date: o.date,
      time: o.time,
      items: o.items,
      createdAt: o.createdAt,
      company: o.companyId ? { name: o.companyId.name, address: o.companyId.address, contact: o.companyId.contact } : undefined,
    }))
    return res.json({ orders })
  } catch {
    return res.status(500).json({ message: 'Failed to list my orders' })
  }
})

// PATCH /api/v1/orders/:id/status - update status (Company Admin)
router.patch('/:id/status', requireAuth, requireRoles('COMPANY_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body as { status?: 'accepted' | 'rejected' }
    if (!status || !['accepted','rejected'].includes(status)) return res.status(400).json({ message: 'invalid status' })
    const company = await Company.findOne({ createdByUserId: req.user!.sub })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    const order = await Order.findOneAndUpdate({ _id: id, companyId: company._id }, { status }, { new: true })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    return res.json({ order })
  } catch {
    return res.status(500).json({ message: 'Failed to update order' })
  }
})

export default router


