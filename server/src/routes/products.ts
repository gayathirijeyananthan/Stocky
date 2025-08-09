import { Router, Request, Response } from 'express'
import mongoose from 'mongoose'
import { requireAuth, requireRoles } from '../middlewares/auth'
import { Product } from '../models/Product'

const router = Router()

// POST /api/v1/products - create product (Company Admin)
router.post('/', requireAuth, requireRoles('COMPANY_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, SKU, price, warehouseStock, expiryDate, imageUrl, companyId } = req.body as {
      name?: string
      SKU?: string
      price?: number
      warehouseStock?: number
      expiryDate?: string
      imageUrl?: string
      companyId?: string
    }

    if (!name || !SKU || price == null || warehouseStock == null) {
      return res.status(400).json({ message: 'name, SKU, price, warehouseStock are required' })
    }

    const resolvedCompanyId = companyId && mongoose.isValidObjectId(companyId) ? new mongoose.Types.ObjectId(companyId) : undefined
    const doc = await Product.create({
      companyId: resolvedCompanyId,
      name,
      SKU,
      price,
      warehouseStock,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      imageUrl,
    })
    return res.status(201).json({ product: doc })
  } catch (e: any) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: 'SKU already exists for this company' })
    }
    return res.status(500).json({ message: 'Failed to create product' })
  }
})

// GET /api/v1/products - list products (Company Admin)
router.get('/', requireAuth, requireRoles('COMPANY_ADMIN'), async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    return res.json({ products })
  } catch {
    return res.status(500).json({ message: 'Failed to fetch products' })
  }
})

export default router


