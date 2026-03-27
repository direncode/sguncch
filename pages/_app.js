import '../styles/globals.css'
import Head from 'next/head'
import { AppProvider } from '../lib/store'

/**
 * Top-level Next.js App component that wraps every page with global state and document head metadata.
 *
 * Renders the active page component inside an <AppProvider> and injects common <Head> tags
 * (viewport, favicon, and theme-color).
 *
 * @param {Object} props
 * @param {import('react').ComponentType<any>} props.Component - The page component to render.
 * @param {Object} props.pageProps - Props to pass to the page component.
 * @returns {import('react').ReactElement} The app element containing the Head and the wrapped page component.
 */
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