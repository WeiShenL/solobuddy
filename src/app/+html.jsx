import { ScrollViewStyleReset } from 'expo-router/html';

export default function HTML({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <script defer src="/telemetry.js" data-website-id="5ca357a4-b7d2-4573-9749-fc7740d167a8" data-performance="true" />
        <script defer src="/recorder.js" data-website-id="5ca357a4-b7d2-4573-9749-fc7740d167a8" data-host-url="https://solo.weishenlo.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
