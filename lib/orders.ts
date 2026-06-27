export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered'

export type OrderLine = {
  name: string
  variant: string
  size: string
  quantity: number
  price: number
}

export type Order = {
  id: string
  customer: string
  email: string
  date: string
  status: OrderStatus
  shipping: string
  items: OrderLine[]
}

export const ORDER_STATUSES: OrderStatus[] = ['Processing', 'Shipped', 'Delivered']

export const ORDERS: Order[] = [
  {
    id: 'SM-2041',
    customer: 'A. Mercer',
    email: 'a.mercer@email.com',
    date: '2026-06-18',
    status: 'Processing',
    shipping: '14 Hollow Lane, London, EC1 4QT, United Kingdom',
    items: [
      { name: 'Oversized Heavyweight Hoodie', variant: 'Onyx Black', size: 'L', quantity: 1, price: 280 },
      { name: 'Boxy Heavyweight Tee', variant: 'Crimson', size: 'M', quantity: 2, price: 150 },
    ],
  },
  {
    id: 'SM-2040',
    customer: 'J. Okafor',
    email: 'j.okafor@email.com',
    date: '2026-06-17',
    status: 'Shipped',
    shipping: '88 Pine St, Brooklyn, NY 11201, United States',
    items: [
      { name: 'Structured Wool Overcoat', variant: 'Charcoal', size: 'M', quantity: 1, price: 640 },
    ],
  },
  {
    id: 'SM-2039',
    customer: 'L. Tanaka',
    email: 'l.tanaka@email.com',
    date: '2026-06-15',
    status: 'Delivered',
    shipping: '3-2-1 Shibuya, Tokyo 150-0002, Japan',
    items: [
      { name: 'Technical Bomber Jacket', variant: 'Matte Black', size: 'S', quantity: 1, price: 420 },
      { name: 'Wide-Leg Cargo Trouser', variant: 'Graphite', size: 'M', quantity: 1, price: 310 },
    ],
  },
  {
    id: 'SM-2038',
    customer: 'R. Silva',
    email: 'r.silva@email.com',
    date: '2026-06-12',
    status: 'Delivered',
    shipping: 'Rua das Flores 210, Lisboa 1200-195, Portugal',
    items: [
      { name: 'Chunky Ribbed Knit', variant: 'Slate Grey', size: 'L', quantity: 1, price: 290 },
    ],
  },
]
