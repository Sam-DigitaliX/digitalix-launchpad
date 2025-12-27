import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/digitalix-logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#process", label: "Process" },
    { href: "#integration", label: "Intégration" },
  ];

  const goTo = (href: string) => {
    // Optionnel: scroll smooth si tu veux
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = href;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center relative group"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsMobileMenuOpen(false);
            }}
          >
            {/* Glow background */}
            <div className="absolute inset-0 blur-lg opacity-50 group-hover:opacity-70 transition-opacity">
              <img src={logo} alt="" className="h-10 w-auto" />
            </div>

            {/* Logo principal */}
            <img src={logo} alt="DigitaliX" className="relative h-10 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  goTo(link.href);
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              type="button"
              className="relative inline-flex items-center justify-center px-6 py-3 rounded-full overflow-hidden group"
              onClick={() => goTo("#audit")}
            >
              {/* Glow background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-red-500/30 blur-md group-hover:blur-lg transition-all" />

              {/* Gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full opacity-100 group-hover:opacity-80 transition-opacity" />

              {/* Button background */}
              <div className="absolute inset-[1px] bg-black rounded-full" />

              {/* Text */}
              <span className="relative text-sm font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Audit Data Quality
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden text-foreground"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-border/50">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </a>
              ))}

              {/* CTA Button mobile */}
              <button
                type="button"
                className="relative inline-flex items-center justify-center px-6 py-3 rounded-full overflow-hidden group mt-4"
                onClick={() => {
                  goTo("#audit");
                  setIsMobileMenuOpen(false);
                }}
              >
                {/* Glow background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-red-500/30 blur-md" />

                {/* Gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full" />

                {/* Button background */}
                <div className="absolute inset-[1px] bg-black rounded-full" />

                {/* Text */}
                <span className="relative text-sm font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Audit Data Quality
                </span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
