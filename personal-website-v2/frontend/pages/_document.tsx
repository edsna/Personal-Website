import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Edson Zandamela - Senior GenAI/MLOps Engineer specializing in AI Infrastructure, LLMs, and Cloud Architecture" />
        <meta name="keywords" content="GenAI, MLOps, DevOps, AI Engineer, Machine Learning, Kubernetes, AWS, Python, LangChain" />
        <meta name="author" content="Edson Zandamela" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Edson Zandamela - GenAI/MLOps Engineer" />
        <meta property="og:description" content="Senior AI Infrastructure Engineer with expertise in LLMs, RAG systems, and scalable cloud platforms" />
        <meta property="og:site_name" content="Edson Zandamela" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Edson Zandamela - GenAI/MLOps Engineer" />
        <meta name="twitter:description" content="Senior AI Infrastructure Engineer with expertise in LLMs, RAG systems, and scalable cloud platforms" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        {/* Preconnect to API */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
      </Head>
      <body className="loading">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
