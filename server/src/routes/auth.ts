import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'

const router = Router()

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body as {
      email?: string
      password?: string
      role?: 'COMPANY_ADMIN' | 'SHOP_OWNER'
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
    const user = await User.create({ email, passwordHash, role })
    const accessToken = signAccessToken({ sub: String(user._id), role: user.role })
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role })
    return res.status(201).json({
      user: { id: user._id, email: user.email, role: user.role },
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
      user: { id: user._id, email: user.email, role: user.role },
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

export default router


