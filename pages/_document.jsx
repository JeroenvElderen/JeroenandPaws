import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="preload"
            as="style"
            href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
          />
          <style
            dangerouslySetInnerHTML={{
              __html: `
              :root {
                --jp-primary: #7c45f3;
                --jp-secondary: #7c45f3;
                --jp-tertiary: #7c45f3;
                --jp-background: #0c081f;
                --jp-surface: #120d23;
                --jp-surface-strong: #1f1535;
                --jp-ink: #f4f2ff;
                --jp-muted: #c9c5d8;
                --jp-border: rgba(255, 255, 255, 0.12);
                --jp-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
                --jp-shadow-soft: 0 16px 40px rgba(0, 0, 0, 0.35);
                --jp-font-body: "DM Sans", "Inter", "Manrope", system-ui, sans-serif;
                --jp-font-heading: "DM Sans", "Inter", "Manrope", system-ui, sans-serif;
              }

              html {
                font-family: var(--jp-font-body);
                font-size: 16px;
                line-height: 1.5;
                background-color: var(--jp-background);
                color: var(--jp-ink);
              }

              body {
                min-height: 100%;
                margin: 0;
                padding: 0;
                background-color: var(--jp-background);
                color: var(--jp-ink);
              }

              *,
              *::before,
              *::after {
                box-sizing: border-box;
              }
            `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
