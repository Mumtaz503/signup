import { Html, Head, Main, NextScript } from "next/document";
import SignupPage from "./SignupPage";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <SignupPage />
        <Main />

        <NextScript />
      </body>
    </Html>
  );
}
