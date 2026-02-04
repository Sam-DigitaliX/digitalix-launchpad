import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/digitalix-logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    { href: "/contact", label: "Contact", isRoute: true },
  ];

  const goTo = (hash: string) => {
    if (location.pathname !== "/") {
      // Navigate to homepage with hash
      navigate("/" + hash);
    } else {
      // Already on homepage, smooth scroll
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // Update URL hash
      window.history.pushState(null, "", hash);
    }
  };

  const goHome = () => {
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        (isScrolled || isMobileMenuOpen)
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center relative group"
            onClick={(e) => {
              e.preventDefault();
              goHome();
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
            {navLinks.map((link) => 
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ) : (
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
              )
            )}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              to="/contact"
              className="relative inline-flex items-center justify-center px-6 py-3 rounded-xl overflow-hidden group"
            >
              {/* Glow background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-cyan-500/30 blur-md group-hover:blur-lg transition-all" />

              {/* Gradient border */}
              <div className="absolute inset-0 rounded-xl opacity-100 group-hover:opacity-80 transition-opacity bg-gradient-to-r from-primary to-secondary" />

              {/* Button background */}
              <div className="absolute inset-[1px] bg-background rounded-lg" />

              {/* Text */}
              <span className="relative text-sm font-semibold text-gradient-primary">
                Réserver mon Audit à 0€
              </span>
            </Link>
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
              {navLinks.map((link) => 
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
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
                )
              )}

              {/* CTA Button mobile */}
              <Link
                to="/contact"
                className="relative inline-flex items-center justify-center px-6 py-3 rounded-full overflow-hidden group mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {/* Glow background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-cyan-500/30 blur-md" />

                {/* Gradient border */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary" />

                {/* Button background */}
                <div className="absolute inset-[1px] bg-background rounded-full" />

                {/* Text */}
                <span className="relative text-sm font-semibold text-gradient-primary">
                  Réserver mon Audit à 0€
                </span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
