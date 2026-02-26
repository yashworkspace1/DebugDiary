import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastProvider } from "@/components/Toast"
import Providers from "@/components/Providers"

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800']
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600']
})

export const metadata: Metadata = {
  title: "DebugDiary — Your Personal Error Journal",
  description: "AI-powered developer error journal. Stop solving the same bugs twice.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} font-sans bg-[#040608] text-[#f0f4ff] antialiased`} suppressHydrationWarning>
        <Providers>
          <ToastProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
