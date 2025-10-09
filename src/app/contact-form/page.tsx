"use client";

import { Header } from "@/components/ui/header";
import { Footer } from "@/components/footer";
import { ContactForm } from "@/components/contact-form";

export default function ContactFormPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground">
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
