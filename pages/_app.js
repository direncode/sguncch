import '../styles/globals.css'
import Head from 'next/head'
import { ClerkProvider } from '@clerk/nextjs'
import { AppProvider } from '../lib/store'

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function App({ Component, pageProps }) {
  const content = (
    <AppProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#0d1117" />
      </Head>
      <Component {...pageProps} />
    </AppProvider>
  )

  // Only wrap with ClerkProvider when Clerk is configured
  if (clerkKey) {
    return <ClerkProvider publishableKey={clerkKey}>{content}</ClerkProvider>
  }

  return content
}
