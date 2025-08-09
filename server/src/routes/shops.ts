import { Router, Request, Response } from 'express'
import { requireAuth, requireRoles } from '../middlewares/auth'
import { User } from '../models/User'
import { Shop } from '../models/Shop'

const router = Router()

// GET /api/v1/shops - list shop owners (Super Admin)
router.get('/', requireAuth, requireRoles('SUPER_ADMIN'), async (_req: Request, res: Response) => {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 })
    return res.json({
      shops: await Promise.all(shops.map(async (s) => {
        const owner = await User.findOne({ linkedShopId: s._id, role: 'SHOP_OWNER' })
        return {
          id: s._id,
          name: s.name,
          address: s.address,
          contact: s.contact,
          ownerEmail: owner?.email,
          status: s.status,
          createdAt: s.createdAt,
        }
      })),
    })
  } catch {
    return res.status(500).json({ message: 'Failed to list shops' })
  }
})

// PATCH /api/v1/shops/:id/status - set shop status (Super Admin)
router.patch('/:id/status', requireAuth, requireRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body as { status?: 'pending' | 'active' | 'inactive' }
    if (!status || !['pending', 'active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'invalid status' })
    }
    const shop = await Shop.findByIdAndUpdate(id, { status }, { new: true })
    if (!shop) return res.status(404).json({ message: 'Shop not found' })
    // keep owner user.shopStatus in sync
    await User.updateOne({ linkedShopId: shop._id, role: 'SHOP_OWNER' }, { shopStatus: status })
    return res.json({ shop: { id: shop._id, name: shop.name, status: shop.status } })
  } catch {
    return res.status(500).json({ message: 'Failed to change shop status' })
  }
})

export default router


