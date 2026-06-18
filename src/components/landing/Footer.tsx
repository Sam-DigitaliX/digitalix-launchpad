import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";
import logo from "@/assets/digitalix-logo.png";

const servicesLinks = [
  { label: "Audit Tracking", to: "/services/audit-tracking" },
  { label: "Migration Server-Side", to: "/services/migration-server-side" },
  { label: "Intégration CAPI", to: "/services/integration-capi" },
  { label: "Conformité RGPD", to: "/services/conformite-rgpd" },
  { label: "Monitoring & Maintenance", to: "/services/monitoring-maintenance" },
  { label: "Formation", to: "/services/formation" },
];

const companyLinks = [
  { label: "À propos", to: "/a-propos" },
  { label: "Cas clients", to: "/cas-clients" },
  { label: "Audit gratuit", to: "/audit-tracking" },
  { label: "Contact", to: "/contact" },
];

const legalLinks = [
  { label: "Mentions légales", to: "/mentions-legales" },
  { label: "Politique de confidentialité", to: "/politique-de-confidentialite" },
];

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/samlepirate/", icon: Linkedin },
  { label: "Malt", href: "https://www.malt.fr/profile/samuelmarange" },
  { label: "Trustpilot", href: "https://fr.trustpilot.com/review/digitalix.xyz" },
];

const linkClass =
  "text-sm text-muted-foreground hover:text-foreground transition-colors";

const Footer = () => {
  const openConsentPreferences = () => {
    // 'information' opens the notice intro screen (page 1) instead of the
    // detailed purposes list (page 2, the default).
    window.Didomi?.preferences.show("information");
  };

  return (
    <footer className="relative z-[1] border-t border-glass-border pt-16 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center">
              <img src={logo} alt="DigitaliX" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Experts du tracking server-side, GTM &amp; conformité RGPD. Basés près de Nancy,
              partout en France et au Luxembourg.
            </p>
            <div className="flex items-center gap-4 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social.icon ? (
                    <social.icon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm">{social.label}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-display text-sm text-foreground">Services</h3>
            <ul className="space-y-2.5">
              {servicesLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Société */}
          <div className="space-y-4">
            <h3 className="font-display text-sm text-foreground">Société</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div className="space-y-4">
            <h3 className="font-display text-sm text-foreground">Légal</h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={openConsentPreferences} className={linkClass}>
                  Choix de consentement
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DigitaliX — Samuel Marangé. Server-Side Tracking
            Specialists.
          </p>
          <p className="text-xs text-muted-foreground font-mono">SIREN 849 349 253</p>
        </div>

        <p className="mt-4 text-center font-mono text-[11px] text-foreground/70">
          Made with ❤️ and respect 🛡️
        </p>
      </div>
    </footer>
  );
};

export default Footer;
