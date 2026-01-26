export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    service: 'project-bold',
    timestamp: new Date().toISOString()
  })
}
