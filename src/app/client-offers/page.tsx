import type { Metadata } from 'next'
import { ClientOffersSite } from '@/components/client-offers/client-offers-site'

export const metadata: Metadata = {
  title: 'LINK AI Business Systems',
  description: 'Customer-facing package site for LINK systems, customer conversations, dashboards, media workflows, trading research, auto logging, and smart automation routing.',
}

export default function ClientOffersPage() {
  return <ClientOffersSite />
}
