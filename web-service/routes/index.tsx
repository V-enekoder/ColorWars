import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import GameBoard from "../islands/GameBoard.tsx";

export default define.page(function Home(ctx) {
  return (
    <div class="px-4 py-8 mx-auto fresh-gradient min-h-screen">
      <Head>
        <title>Color Wars</title>
      </Head>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo"
        />

        <h1 class="text-4xl font-bold mb-8">Color Wars</h1>
        <GameBoard rows={6} columns={6} critical_points={4} />
      </div>
    </div>
  );
});
