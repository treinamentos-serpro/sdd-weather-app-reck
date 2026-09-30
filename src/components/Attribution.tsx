export default function Attribution() {
  return (
    <footer className="space-y-1 text-sm text-white/70">
      <p>
        Dados meteorológicos:{' '}
        <a
          className="underline underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          href="https://open-meteo.com/"
        >
          Open-Meteo
        </a>
      </p>
      <p>As previsões podem mudar.</p>
    </footer>
  );
}
