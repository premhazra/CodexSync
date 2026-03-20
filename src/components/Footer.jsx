// ─── Footer ───────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="px-5 py-3 border-t border-zinc-800/60 flex items-center justify-between">
      <span className="text-[10px] text-zinc-600">
        CodexSync v1.0.0
      </span>
      <span className="text-[10px]">
        <span className="text-zinc-300">Made with ♥ by </span>
        <a
          href="https://github.com/premhazra"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          @premhazra
        </a>
      </span>
    </footer>
  );
}
