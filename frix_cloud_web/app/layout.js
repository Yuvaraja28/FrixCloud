export const metadata = {
  title: 'Frix Cloud',
  description: 'Frix Cloud',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
