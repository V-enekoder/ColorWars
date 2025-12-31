export default function Home() {
  return (
    <div class="p-8">
      <h1 class="text-4xl font-bold">Bienvenido a Color Wars</h1>
      <a
        href="/game/JvsJ"
        class="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Jugar Humano vs Humano
      </a>

      <a
        href="/game/JvsIA"
        class="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Jugar Humano vs IA random
      </a>
    </div>
  );
}
