import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User'
import { Shop } from '../models/Shop'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { requireAuth } from '../middlewares/auth'

const router = Router()

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role, shop } = req.body as {
      email?: string
      password?: string
      role?: 'COMPANY_ADMIN' | 'SHOP_OWNER'
      shop?: { name?: string; address?: string; contact?: string }
    }
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'email, password, role required' })
    }
    if (!['COMPANY_ADMIN', 'SHOP_OWNER'].includes(role)) {
      return res.status(400).json({ message: 'invalid role' })
    }
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'email already registered' })
    const passwordHash = await bcrypt.hash(password, 10)
    // For SHOP_OWNER, start in pending status and create a Shop record
    let user = await User.create({
      email,
      passwordHash,
      role,
      ...(role === 'SHOP_OWNER' ? { shopStatus: 'pending' as const } : {}),
    })

    let shopId: string | undefined
    if (role === 'SHOP_OWNER') {
      if (!shop || !shop.name) {
        return res.status(400).json({ message: 'shop.name required for SHOP_OWNER' })
      }
      const createdShop = await Shop.create({
        name: shop.name,
        address: shop.address,
        contact: shop.contact,
        createdByUserId: user._id,
        status: 'pending',
      })
      shopId = String(createdShop._id)
      user = (await User.findByIdAndUpdate(
        user._id,
        { linkedShopId: createdShop._id, shopStatus: 'pending' },
        { new: true }
      ))!
    }

    const accessToken = signAccessToken({ sub: String(user._id), role: user.role, ...(shopId ? { shopId } : {}) })
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role, ...(shopId ? { shopId } : {}) })
    return res.status(201).json({
      user: { id: user._id, email: user.email, role: user.role, ...(user.shopStatus ? { shopStatus: user.shopStatus } : {}) },
      tokens: { accessToken, refreshToken },
    })
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' })
  }
})

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || !password) return res.status(400).json({ message: 'email and password required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: 'invalid credentials' })
    const accessToken = signAccessToken({ sub: String(user._id), role: user.role })
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role })
    return res.json({
      user: { id: user._id, email: user.email, role: user.role, ...(user.shopStatus ? { shopStatus: user.shopStatus } : {}) },
      tokens: { accessToken, refreshToken },
    })
  } catch {
    return res.status(500).json({ message: 'Login failed' })
  }
})

// POST /api/v1/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string }
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' })
    const payload = verifyRefreshToken(refreshToken)
    const accessToken = signAccessToken({
      sub: payload.sub,
      role: payload.role,
      ...(payload.companyId ? { companyId: payload.companyId } : {}),
      ...(payload.shopId ? { shopId: payload.shopId } : {}),
    })
    return res.json({ accessToken })
  } catch {
    return res.status(401).json({ message: 'invalid refresh token' })
  }
})

// GET /api/v1/auth/me - current user
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.sub)
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json({ user: { id: user._id, email: user.email, role: user.role, ...(user.shopStatus ? { shopStatus: user.shopStatus } : {}) } })
  } catch {
    return res.status(500).json({ message: 'Failed to fetch user' })
  }
})

// PATCH /api/v1/auth/me - update current user (email only for now)
router.patch('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    const update: any = {}
    if (email) update.email = email
    if (password) update.passwordHash = await bcrypt.hash(password, 10)
    const user = await User.findByIdAndUpdate(req.user!.sub, update, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json({ user: { id: user._id, email: user.email, role: user.role, ...(user.shopStatus ? { shopStatus: user.shopStatus } : {}) } })
  } catch {
    return res.status(500).json({ message: 'Failed to update user' })
  }
})

export default router


