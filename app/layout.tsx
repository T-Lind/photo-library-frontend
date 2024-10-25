import './globals.css'
import { Montserrat } from 'next/font/google'

// const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata = {
  title: 'Photo Management System',
  description: 'Search and manage your photos with ease',
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
      <html lang="en">
      <body className={montserrat.className}>{children}</body>
      </html>
  )
}
