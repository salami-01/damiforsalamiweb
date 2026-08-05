import crypto from 'crypto'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) {
    throw new Error(
      'PAYSTACK_SECRET_KEY is not set. Add it to your environment variables.',
    )
  }
  return key
}

export type PaystackInitParams = {
  email: string
  /** Amount in the smallest currency unit (kobo for NGN — multiply naira by 100). */
  amount: number
  currency?: string
  callback_url?: string
  metadata?: Record<string, unknown>
}

export type PaystackInitResult = {
  authorization_url: string
  access_code: string
  reference: string
}

export type PaystackTransactionData = {
  status: 'success' | 'failed' | 'abandoned' | string
  reference: string
  amount: number
  currency: string
  channel: string | null
  paid_at: string | null
  gateway_response: string
  customer: { email: string; [key: string]: unknown }
  metadata: Record<string, any>
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    // Paystack calls should never be cached.
    cache: 'no-store',
  })

  let body: any
  try {
    body = await res.json()
  } catch {
    throw new Error(`Paystack returned a non-JSON response (status ${res.status}).`)
  }

  if (!res.ok || body?.status === false) {
    throw new Error(body?.message || `Paystack request failed with status ${res.status}.`)
  }

  return body.data as T
}

/**
 * Initializes a Paystack transaction and returns the checkout URL to redirect the customer to.
 */
export async function initializeTransaction(
  params: PaystackInitParams,
): Promise<PaystackInitResult> {
  if (!params.email) throw new Error('Cannot initialize a transaction without a customer email.')
  if (!Number.isFinite(params.amount) || params.amount <= 0) {
    throw new Error('Cannot initialize a transaction with a non-positive amount.')
  }

  return paystackFetch<PaystackInitResult>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount),
      currency: params.currency ?? 'NGN',
      callback_url: params.callback_url,
      metadata: params.metadata,
    }),
  })
}

/**
 * Verifies a transaction by reference directly against Paystack's API.
 * This is the only source of truth for whether a payment actually succeeded —
 * never trust client-supplied status or amount.
 */
export async function verifyTransaction(reference: string): Promise<PaystackTransactionData> {
  if (!reference) throw new Error('Cannot verify a transaction without a reference.')
  return paystackFetch<PaystackTransactionData>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  )
}

/**
 * Validates the `x-paystack-signature` header on incoming webhook requests.
 * Paystack signs the raw request body with your secret key (HMAC SHA512).
 * Must be checked against the raw body string — not a re-serialized JSON object,
 * since key ordering/whitespace differences would break the signature match.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false
  const expected = crypto.createHmac('sha512', getSecretKey()).update(rawBody).digest('hex')
  // Timing-safe comparison to avoid leaking signature bytes via response-time side channel.
  const expectedBuf = Buffer.from(expected, 'hex')
  const signatureBuf = Buffer.from(signature, 'hex')
  if (expectedBuf.length !== signatureBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, signatureBuf)
}
// this is paystack.ts file that provides functions to initialize and verify Paystack transactions, as well as validate webhook signatures. It uses the Paystack API and requires a secret key from environment variables.