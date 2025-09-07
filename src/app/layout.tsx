import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Real Circuit Image Copilot',
  description: 'Transform natural language into realistic circuit diagrams, breadboard layouts, PCBs, and assembly guides using AI and open-source EDA tools.',
  keywords: ['circuit design', 'PCB', 'breadboard', 'electronics', 'AI', 'EDA', 'KiCad', 'Fritzing'],
  authors: [{ name: 'Real Circuit Image Copilot' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
