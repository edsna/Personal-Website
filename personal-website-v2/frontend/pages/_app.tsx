import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Remove loading class when app mounts
    document.body.classList.remove('loading')
  }, [])

  return <Component {...pageProps} />
}
