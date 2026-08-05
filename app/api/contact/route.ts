import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { name, email, message } = await request.json()

  if (!name || !email || !message) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return Response.json({ error: 'Invalid field types' }, { status: 400 })
  }

  if (name.length > 100) {
    return Response.json({ error: 'Name is too long' }, { status: 400 })
  }
  if (email.length > 254) {
    return Response.json({ error: 'Email is too long' }, { status: 400 })
  }
  if (message.length > 5000) {
    return Response.json({ error: 'Message is too long (5000 character limit)' }, { status: 400 })
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }
  const supabase = createAdminClient()
  const { error: dbError } = await supabase
    .from('contact_messages')
    .insert({ name, email, message })

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  try {
    await resend.emails.send({
      from: 'Salami Website <onboarding@resend.dev>',
      to: ['salamiabdulsalami26@gmail.com'],
      subject: `New message from ${name}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
    })
  } catch (emailError) {
    console.error('Email send failed, but message was saved:', emailError)
  }

  return Response.json({ success: true })
}
//this is app\api\contact\route.ts