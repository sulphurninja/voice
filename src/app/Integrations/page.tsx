import { Integrations } from '@/components/integrations'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/footer'

export default function IntegrationsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground">
        <Integrations />
      </main>
      <Footer />
    </>
  )
}
