import Image from 'next/image'
import styles from './styles.scss'
import { Varela } from 'next/font/google'

const varela = Varela({ weight: '400', subsets: ['latin'] })

export default function Home() {
  return (
    <div className={"container"}>
        <Image src="/favicon.ico" width={'150'} height={'150'}alt="Microsoft Logo" />
        <div className={"text"}>FrixCloud</div>
        <div className={"subtext"}>Seamless Solutions In The Cloud: Unleash Your Potential</div>
        <a href='/server' className={["cool-button", varela.className].join(' ')} >View the server</a>
    </div>
  )
}
