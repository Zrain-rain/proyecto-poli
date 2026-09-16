import { sign, verify } from 'hono/jwt'

async function test() {
  const secret = 'fallback-secret'
  const payload = {
    username: 'admin',
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
  }
  
  try {
    const token = await sign(payload, secret)
    console.log('Token:', token)
    
    const decoded = await verify(token, secret)
    console.log('Decoded:', decoded)
  } catch (e) {
    console.error('Error:', e)
  }
}

test()
