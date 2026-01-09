export function Header() {
  return (
    <header className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 border-2 border-white/80 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">FX</span>
              </div>
              <div className="border-l-2 border-white/30 pl-3">
                <span className="text-white text-base font-light">Simple Currency Converter</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <a
              href="#"
              className="text-white hover:text-blue-200 transition-colors text-sm"
            >
              Home
            </a>
            <a
              href="#"
              className="text-white hover:text-blue-200 transition-colors text-sm"
            >
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
