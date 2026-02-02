import { Link } from "react-router-dom";
import logo from "@/assets/digitalix-logo.png";

const Footer = () => {
  return (
    <footer className="py-12 bg-background border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="DigitaliX" className="h-8 w-auto" />
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-8">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Mentions Légales
            </a>
            <Link
              to="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2025 DigitaliX. Server-Side Tracking Specialists.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
