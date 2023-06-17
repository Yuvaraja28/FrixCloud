import { styles } from './styles.scss'
import Image from 'next/image'
import { Inter, Lexend } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const lexend = Lexend({ weight: ['700'], subsets: ['latin'] })

export const metadata = {
  title: 'Frix Cloud Panel',
  description: 'Frix Cloud',
}

export default function ServersRootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className={'title_navbar'}>
                    <div className={'logo_nav'}>
                        <Image src={'/favicon.ico'} width={'30'} height={'30'} alt='Logo'></Image>
                        <span className={lexend.className}>Frix Cloud</span>
                    </div>
                </div>
                <div className={'main-container'}>
                    {children}
                </div>            
            </body>
        </html>
    )
}
