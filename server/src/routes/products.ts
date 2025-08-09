import { Router, Request, Response } from 'express'
import mongoose from 'mongoose'
import { requireAuth, requireRoles } from '../middlewares/auth'
import { Company } from '../models/Company'
import { Product } from '../models/Product'

const router = Router()

// POST /api/v1/products - create product (Company Admin)
router.post('/', requireAuth, requireRoles('COMPANY_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, SKU, price, warehouseStock, expiryDate, imageUrl } = req.body as {
      name?: string
      SKU?: string
      price?: number
      warehouseStock?: number
      expiryDate?: string
      imageUrl?: string
    }

    if (!name || !SKU || price == null || warehouseStock == null) {
      return res.status(400).json({ message: 'name, SKU, price, warehouseStock are required' })
    }

    let companyObjectId: mongoose.Types.ObjectId | undefined
    const userCompanyId = req.user?.companyId
    if (userCompanyId && mongoose.isValidObjectId(userCompanyId)) {
      companyObjectId = new mongoose.Types.ObjectId(userCompanyId)
    } else {
      const company = await Company.findOne({ createdByUserId: req.user!.sub, status: 'active' })
      if (!company) {
        return res.status(400).json({ message: 'No active company found for user' })
      }
      companyObjectId = company._id as mongoose.Types.ObjectId
    }

    const doc = await Product.create({
      companyId: companyObjectId,
      name,
      SKU,
      price,
      warehouseStock,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      imageUrl,
    })
    return res.status(201).json({ product: {
      _id: doc._id,
      name: doc.name,
      SKU: doc.SKU,
      price: doc.price,
      warehouseStock: doc.warehouseStock,
      expiryDate: doc.expiryDate,
      createdAt: doc.createdAt,
    } })
  } catch (e: any) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: 'SKU already exists for this company' })
    }
    return res.status(500).json({ message: 'Failed to create product' })
  }
})

// GET /api/v1/products - list products (Company Admin)
router.get('/', requireAuth, requireRoles('COMPANY_ADMIN'), async (req: Request, res: Response) => {
  try {
    let companyObjectId: mongoose.Types.ObjectId | undefined
    const userCompanyId = req.user?.companyId
    if (userCompanyId && mongoose.isValidObjectId(userCompanyId)) {
      companyObjectId = new mongoose.Types.ObjectId(userCompanyId)
    } else {
      const company = await Company.findOne({ createdByUserId: req.user!.sub, status: 'active' })
      if (!company) {
        return res.status(400).json({ message: 'No active company found for user' })
      }
      companyObjectId = company._id as mongoose.Types.ObjectId
    }

    const products = await Product.find({ companyId: companyObjectId })
      .select('name SKU price warehouseStock expiryDate createdAt')
      .sort({ createdAt: -1 })
      .lean()
    return res.json({ products })
  } catch {
    return res.status(500).json({ message: 'Failed to fetch products' })
  }
})

export default router

// PATCH /api/v1/products/:id - update product (Company Admin)
router.patch('/:id', requireAuth, requireRoles('COMPANY_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'invalid id' })

    let companyObjectId: mongoose.Types.ObjectId | undefined
    const userCompanyId = req.user?.companyId
    if (userCompanyId && mongoose.isValidObjectId(userCompanyId)) {
      companyObjectId = new mongoose.Types.ObjectId(userCompanyId)
    } else {
      const company = await Company.findOne({ createdByUserId: req.user!.sub, status: 'active' })
      if (!company) {
        return res.status(400).json({ message: 'No active company found for user' })
      }
      companyObjectId = company._id as mongoose.Types.ObjectId
    }

    const { name, SKU, price, warehouseStock, expiryDate, imageUrl } = req.body as {
      name?: string
      SKU?: string
      price?: number
      warehouseStock?: number
      expiryDate?: string
      imageUrl?: string
    }

    const update: any = {}
    if (name != null) update.name = name
    if (SKU != null) update.SKU = SKU
    if (price != null) update.price = price
    if (warehouseStock != null) update.warehouseStock = warehouseStock
    if (expiryDate != null) update.expiryDate = expiryDate ? new Date(expiryDate) : undefined
    if (imageUrl != null) update.imageUrl = imageUrl

    const product = await Product.findOneAndUpdate({ _id: id, companyId: companyObjectId }, update, { new: true })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    return res.json({ product: {
      _id: product._id,
      name: product.name,
      SKU: product.SKU,
      price: product.price,
      warehouseStock: product.warehouseStock,
      expiryDate: product.expiryDate,
      createdAt: product.createdAt,
    } })
  } catch (e: any) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: 'SKU already exists for this company' })
    }
    return res.status(500).json({ message: 'Failed to update product' })
  }
})

// DELETE /api/v1/products/:id - delete product (Company Admin)
router.delete('/:id', requireAuth, requireRoles('COMPANY_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'invalid id' })

    let companyObjectId: mongoose.Types.ObjectId | undefined
    const userCompanyId = req.user?.companyId
    if (userCompanyId && mongoose.isValidObjectId(userCompanyId)) {
      companyObjectId = new mongoose.Types.ObjectId(userCompanyId)
    } else {
      const company = await Company.findOne({ createdByUserId: req.user!.sub, status: 'active' })
      if (!company) {
        return res.status(400).json({ message: 'No active company found for user' })
      }
      companyObjectId = company._id as mongoose.Types.ObjectId
    }

    const result = await Product.findOneAndDelete({ _id: id, companyId: companyObjectId })
    if (!result) return res.status(404).json({ message: 'Product not found' })
    return res.status(204).send()
  } catch {
    return res.status(500).json({ message: 'Failed to delete product' })
  }
})

export default router


