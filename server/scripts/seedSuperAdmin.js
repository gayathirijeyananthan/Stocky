/* Seed or ensure a SUPER_ADMIN user exists */
const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@stocky.io'
  const plainPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123'
  const passwordHash = bcrypt.hashSync(plainPassword, 10)
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI
  const dbName = process.env.MONGO_DB_NAME || process.env.DB_NAME || 'stocky'
  if (!uri) {
    console.error('MONGODB_URI not set')
    process.exit(1)
  }
  await mongoose.connect(uri, { dbName })
  const res = await mongoose.connection.collection('users').updateOne(
    { email },
    { $setOnInsert: { email, passwordHash, role: 'SUPER_ADMIN', createdAt: new Date(), updatedAt: new Date() } },
    { upsert: true }
  )
  if (res.upsertedId) {
    console.log('Created SUPER_ADMIN:', email)
  } else {
    console.log('SUPER_ADMIN already exists:', email)
  }
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})



