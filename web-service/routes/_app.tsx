import { Head } from "fresh/runtime";
import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <Head>
        <title>Color Wars</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #e2e8f0 transparent;
          }
        `,
          }}
        />
      </Head>
      <body>
        <Component />
      </body>
    </html>
  );
}
