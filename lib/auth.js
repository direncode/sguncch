import { ADMIN_KEY } from './data'

export function verifyAdmin(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  return authHeader.replace('Bearer ', '') === ADMIN_KEY
}

export function withAdminAuth(handler) {
  return async (req, res) => {
    if (!verifyAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return handler(req, res)
  }
}
