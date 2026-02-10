import '../styles/globals.css'
import Head from 'next/head'
import { AppProvider } from '../lib/store'

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#0d1117" />
      </Head>
      <Component {...pageProps} />
    </AppProvider>
  )
}
