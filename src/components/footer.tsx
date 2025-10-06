import Image from "next/image";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer className="border-t border-gray-800 py-12 mt-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 z-10">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/Wow.png"
                  alt="Wow AI"
                  width={44}
                  height={44}
                  className="h-11 w-auto"
                />
                <div className="absolute -top-1 -right-1">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-600"></span>
                  </div>
                </div>
              </motion.div>

              <motion.span
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Xseize
              </motion.span>
            </Link>
            <p className="text-gray-400 p-4 max-w-xl text-center md:text-left">
              Transforming business communications with AI-powered voice agents that sound human.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold mb-2">Product</h3>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">API</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-semibold mb-2">Company</h3>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-semibold mb-2">Legal</h3>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Xseize. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
