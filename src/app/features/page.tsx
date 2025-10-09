"use client";

import { Header } from '@/components/ui/header'
import { Footer } from '@/components/footer'
import { Features } from '@/components/features'

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground">
        <Features />
      </main>
      <Footer />
    </>
  )
}
