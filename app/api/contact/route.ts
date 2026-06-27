import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { name, email, message } = await request.json()

  if (!name || !email || !message) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }

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