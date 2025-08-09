import jwt from 'jsonwebtoken'

export interface JwtPayload {
  sub: string
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'SHOP_OWNER'
  companyId?: string
  shopId?: string
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
const ACCESS_TTL: string | number = process.env.ACCESS_TOKEN_TTL ?? '15m'
const REFRESH_TTL: string | number = process.env.REFRESH_TOKEN_TTL ?? '7d'

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET as any, { expiresIn: ACCESS_TTL as any })
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET as any, { expiresIn: REFRESH_TTL as any })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET as any) as JwtPayload
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET as any) as JwtPayload
}


