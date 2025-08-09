import { Router, Request, Response } from 'express'
import { requireAuth, requireRoles } from '../middlewares/auth'
import { Company } from '../models/Company'
import { Product } from '../models/Product'

const router = Router()

// GET /api/v1/companies - list companies (Super Admin)
router.get('/', requireAuth, requireRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: 'pending' | 'active' | 'inactive' }
    const query = status ? { status } : {}
    const companies = await Company.find(query).sort({ createdAt: -1 })
    return res.json({ companies })
  } catch (e) {
    return res.status(500).json({ message: 'Failed to list companies' })
  }
})

// GET /api/v1/companies/public - list active companies (Shop Owners can view)
router.get('/public', requireAuth, async (_req: Request, res: Response) => {
  try {
    const companies = await Company.find({ status: 'active' }).sort({ createdAt: -1 })
    return res.json({ companies })
  } catch {
    return res.status(500).json({ message: 'Failed to list companies' })
  }
})

// GET /api/v1/companies/:id/public - get a single active company (Shop Owners can view)
router.get('/:id/public', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const company = await Company.findOne({ _id: id, status: 'active' })
      .select('name address contact status createdAt updatedAt')
      .lean()
    if (!company) return res.status(404).json({ message: 'Company not found' })
    return res.json({ company })
  } catch {
    return res.status(500).json({ message: 'Failed to fetch company' })
  }
})

// GET /api/v1/companies/:id/products/public - list products for a specific active company (Shop Owners can view)
router.get('/:id/products/public', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const company = await Company.findOne({ _id: id, status: 'active' }).select('_id').lean()
    if (!company) return res.status(404).json({ message: 'Company not found' })
    const products = await Product.find({ companyId: company._id })
      .select('name SKU price warehouseStock expiryDate createdAt')
      .sort({ createdAt: -1 })
      .lean()
    return res.json({ products })
  } catch {
    return res.status(500).json({ message: 'Failed to fetch products' })
  }
})

// POST /api/v1/companies - create company (Company Admin registers company, status pending)
router.post('/', requireAuth, requireRoles('COMPANY_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, address, contact } = req.body as { name?: string; address?: string; contact?: string }
    if (!name) return res.status(400).json({ message: 'name required' })
    const company = await Company.create({ name, address, contact, createdByUserId: req.user!.sub, status: 'pending' })
    return res.status(201).json({ company })
  } catch (e) {
    return res.status(500).json({ message: 'Failed to create company' })
  }
})

// GET /api/v1/companies/me - fetch company created by current admin (if any)
router.get('/me', requireAuth, requireRoles('COMPANY_ADMIN'), async (req: Request, res: Response) => {
  try {
    const company = await Company.findOne({ createdByUserId: req.user!.sub })
    return res.json({ company })
  } catch {
    return res.status(500).json({ message: 'Failed to fetch company' })
  }
})

// POST /api/v1/companies/:id/approve - approve company (Super Admin)
router.post('/:id/approve', requireAuth, requireRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const company = await Company.findByIdAndUpdate(id, { status: 'active' }, { new: true })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    return res.json({ company })
  } catch {
    return res.status(500).json({ message: 'Failed to approve company' })
  }
})

// PATCH /api/v1/companies/:id/status - change company status (Super Admin)
router.patch('/:id/status', requireAuth, requireRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body as { status?: 'pending' | 'active' | 'inactive' }
    if (!status || !['pending', 'active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'invalid status' })
    }
    const company = await Company.findByIdAndUpdate(id, { status }, { new: true })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    return res.json({ company })
  } catch {
    return res.status(500).json({ message: 'Failed to change company status' })
  }
})

export default router


