export default function Home() {
  return (
    <div class="p-8">
      <h1 class="text-4xl font-bold">Bienvenido a Color Wars</h1>
      <p class="my-4">Haz clic abajo para navegar:</p>
      <a
        href="/game"
        class="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Jugar
      </a>
    </div>
  );
}
