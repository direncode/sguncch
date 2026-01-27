import '../styles/globals.css'
import { AppProvider } from '../lib/store'

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  )
}
