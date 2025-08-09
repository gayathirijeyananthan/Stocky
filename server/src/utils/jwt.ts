import jwt from 'jsonwebtoken'

export interface JwtPayload {
  sub: string
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'SHOP_OWNER'
  companyId?: string
  shopId?: string
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m'
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || '7d'

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL })
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload
}


