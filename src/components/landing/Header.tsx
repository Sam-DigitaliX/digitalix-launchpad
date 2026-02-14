import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  ShoppingCart,
  Cloud,
  Search,
  Server,
  Share2,
  ShieldCheck,
  Activity,
  GraduationCap,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  MessageSquare,
  Scan,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/digitalix-logo.png";

/* ──────────────────────── Dropdown Data ──────────────────────── */

const solutionsItems = [
  {
    icon: Users,
    label: "Consultants & Agences",
    description: "Infrastructure server-side clé en main pour vos clients",
    href: "/consultants",
  },
  {
    icon: ShoppingCart,
    label: "E-commerce & Annonceurs",
    description: "Récupérez vos conversions perdues et boostez votre ROAS",
    href: "#",
    comingSoon: true,
  },
  {
    icon: Cloud,
    label: "SaaS",
    description: "Trackez du signup au MRR, sans adblockers",
    href: "#",
    comingSoon: true,
  },
];

const servicesItems = [
  {
    icon: Search,
    label: "Audit Tracking",
    description: "Diagnostic complet sous 48h",
    href: "/services/audit-tracking",
  },
  {
    icon: Server,
    label: "Migration Server-Side",
    description: "Zéro downtime, zéro perte",
    href: "/services/migration-server-side",
  },
  {
    icon: Share2,
    label: "Intégration CAPI",
    description: "Meta, Google, TikTok, LinkedIn",
    href: "/services/integration-capi",
  },
  {
    icon: ShieldCheck,
    label: "Conformité RGPD",
    description: "Consent Mode v2 & CMP",
    href: "/services/conformite-rgpd",
  },
  {
    icon: Activity,
    label: "Monitoring & Maintenance",
    description: "Surveillance 24/7 de vos flux",
    href: "/services/monitoring-maintenance",
  },
  {
    icon: GraduationCap,
    label: "Formation",
    description: "Rendez vos équipes autonomes",
    href: "/services/formation",
  },
];

const ressourcesItems = [
  { icon: BookOpen, label: "Blog", description: "Articles & insights", href: "#" },
  { icon: FileText, label: "Guides", description: "Ressources téléchargeables", href: "#" },
  { icon: Video, label: "Webinaires", description: "Sessions live & replays", href: "#" },
  { icon: HelpCircle, label: "FAQ", description: "Questions fréquentes", href: "/#faq" },
  { icon: MessageSquare, label: "Contact", description: "Parlons de votre projet", href: "/contact" },
];

/* ──────────────────────── Mega Link ──────────────────────── */

interface DropdownItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
  comingSoon?: boolean;
}

const MegaLink = ({
  item,
  onClick,
}: {
  item: DropdownItem;
  onClick?: () => void;
}) => {
  const inner = (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors duration-200 ${
        item.comingSoon
          ? "opacity-50 cursor-default"
          : "group hover:bg-white/[0.04]"
      }`}
    >
      <div className="icon-gradient w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:border-transparent">
        <item.icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            {item.label}
          </span>
          {item.comingSoon && (
            <span className="text-[10px] font-medium text-muted-foreground bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 rounded-md">
              Bientôt
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.description}
        </p>
      </div>
      {!item.comingSoon && (
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
      )}
    </div>
  );

  if (item.comingSoon) return <div>{inner}</div>;

  return (
    <Link to={item.href} onClick={onClick}>
      {inner}
    </Link>
  );
};

/* ──────────────────────── Featured Illustration Card ──────────────────────── */

const FeaturedAuditCard = ({ onClick }: { onClick?: () => void }) => (
  <Link
    to="/audit-tracking"
    onClick={onClick}
    className="block h-full rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.05] transition-colors group"
  >
    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/15 border border-primary/20 text-[10px] font-semibold uppercase tracking-wider">
      <span className="text-gradient-primary">Audit Offert</span>
    </span>

    {/* Concentric circles — Evervault style illustration */}
    <div className="relative mx-auto my-6 w-36 h-36">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="orbit-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${100 - i * 22}%`,
            height: `${100 - i * 22}%`,
          }}
        />
      ))}
      <div className="icon-gradient absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:border-transparent">
        <Scan className="w-5 h-5" />
      </div>
    </div>

    <p className="text-sm font-medium text-foreground leading-snug">
      Votre diagnostic tracking complet en 30 secondes
    </p>
  </Link>
);

/* ──────────────────────── Mobile Accordion ──────────────────────── */

const MobileAccordion = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex items-center justify-between w-full py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pb-2 pl-2 space-y-1">{children}</div>
      </div>
    </div>
  );
};

/* ──────────────────────── Header ──────────────────────── */

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Cleanup timeout
  useEffect(() => {
    return () => clearTimeout(closeTimeoutRef.current);
  }, []);

  const openNav = (id: string) => {
    clearTimeout(closeTimeoutRef.current);
    setOpenDropdown(id);
  };

  const scheduleClose = () => {
    closeTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 250);
  };

  const cancelClose = () => {
    clearTimeout(closeTimeoutRef.current);
  };

  const goHome = () => {
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/");
    }
  };

  const closeMobile = () => setIsMobileMenuOpen(false);
  const closeDropdown = () => setOpenDropdown(null);

  const isPathActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const triggerClass = (id: string, activePaths: string[]) => {
    const isActive =
      activePaths.some((p) => isPathActive(p)) || openDropdown === id;
    return `flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-white/[0.08] text-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "backdrop-blur-xl border-b border-white/[0.06]"
          : "border-b border-transparent"
      }`}
    >
      {/* SVG gradient defs for icon coloring */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(262 83% 58%)" />
            <stop offset="100%" stopColor="hsl(188 94% 43%)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center relative group shrink-0"
            onClick={(e) => {
              e.preventDefault();
              goHome();
              closeMobile();
            }}
          >
            <div className="absolute inset-0 blur-lg opacity-50 group-hover:opacity-70 transition-opacity">
              <img src={logo} alt="" className="h-10 w-auto" />
            </div>
            <img src={logo} alt="DigitaliX" className="relative h-10 w-auto" />
          </a>

          {/* ──── Desktop: Nav Pill ──── */}
          <nav className="hidden lg:flex items-center rounded-full border border-white/[0.12] bg-white/[0.07] px-1 py-1">
            {/* Accueil */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                location.pathname === "/"
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onMouseEnter={() => setOpenDropdown(null)}
            >
              Accueil
            </Link>

            {/* Solutions trigger */}
            <button
              type="button"
              className={triggerClass("solutions", ["/consultants", "/saas"])}
              onMouseEnter={() => openNav("solutions")}
              onMouseLeave={scheduleClose}
              onClick={() =>
                openDropdown === "solutions"
                  ? closeDropdown()
                  : openNav("solutions")
              }
            >
              Solutions
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === "solutions" ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Services trigger */}
            <button
              type="button"
              className={triggerClass("services", ["/services"])}
              onMouseEnter={() => openNav("services")}
              onMouseLeave={scheduleClose}
              onClick={() =>
                openDropdown === "services"
                  ? closeDropdown()
                  : openNav("services")
              }
            >
              Services
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === "services" ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Ressources trigger */}
            <button
              type="button"
              className={triggerClass("ressources", ["/audit-tracking"])}
              onMouseEnter={() => openNav("ressources")}
              onMouseLeave={scheduleClose}
              onClick={() =>
                openDropdown === "ressources"
                  ? closeDropdown()
                  : openNav("ressources")
              }
            >
              Ressources
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === "ressources" ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Contact link */}
            <Link
              to="/contact"
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                isPathActive("/contact")
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={closeDropdown}
            >
              Contact
            </Link>
          </nav>

          {/* ──── Desktop: CTA ──── */}
          <div className="hidden lg:block shrink-0">
            <Button
              variant="heroGradient"
              size="default"
              className="rounded-full opacity-85 hover:opacity-100 transition-all duration-200"
              asChild
            >
              <Link to="/contact">Réserver mon Audit</Link>
            </Button>
          </div>

          {/* ──── Mobile: Hamburger ──── */}
          <button
            type="button"
            className="lg:hidden text-foreground"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ──── Mega Dropdown Panel ──── */}
        <div
          className={`hidden lg:block absolute left-1/2 -translate-x-1/2 top-20 pt-2 z-50 w-full max-w-[880px] transition-all duration-200 ${
            openDropdown
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c18]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* ── Solutions ── */}
            {openDropdown === "solutions" && (
              <div className="p-6">
                <p className="px-4 pb-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Solutions par profil
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {solutionsItems.map((item) => {
                    const inner = (
                      <div
                        className={`rounded-xl border border-white/[0.06] p-5 h-full flex flex-col transition-colors duration-200 ${
                          item.comingSoon
                            ? "opacity-50 cursor-default bg-white/[0.02]"
                            : "group bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="icon-gradient w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:border-transparent">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            {item.label}
                          </h4>
                          {item.comingSoon && (
                            <span className="text-[10px] font-medium text-muted-foreground bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 rounded-md">
                              Bientôt
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                          {item.description}
                        </p>
                        {!item.comingSoon && (
                          <div className="flex items-center gap-1 mt-4 text-xs font-medium transition-all duration-300">
                            <span className="text-gradient-primary group-hover:bg-none group-hover:text-foreground transition-all duration-300">Découvrir</span>
                            <ChevronRight className="w-3.5 h-3.5 text-secondary group-hover:text-foreground transition-colors duration-300" />
                          </div>
                        )}
                      </div>
                    );

                    if (item.comingSoon) {
                      return (
                        <div key={item.label} className="h-full">
                          {inner}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={closeDropdown}
                        className="h-full"
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Services ── */}
            {openDropdown === "services" && (
              <div>
                <div className="p-6">
                  <p className="px-4 pb-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Nos services
                  </p>
                  <div className="grid grid-cols-2 gap-x-4">
                    {servicesItems.map((item) => (
                      <MegaLink
                        key={item.label}
                        item={item}
                        onClick={closeDropdown}
                      />
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/[0.06] px-10 py-4">
                  <Link
                    to="/services"
                    className="group inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                    onClick={closeDropdown}
                  >
                    <span className="text-gradient-primary group-hover:bg-none group-hover:text-foreground transition-all duration-300">Voir tous les services</span>
                    <ChevronRight className="w-3.5 h-3.5 text-secondary group-hover:text-foreground transition-colors duration-300" />
                  </Link>
                </div>
              </div>
            )}

            {/* ── Ressources ── */}
            {openDropdown === "ressources" && (
              <div className="grid grid-cols-[280px_1fr]">
                {/* Featured illustration card */}
                <div className="p-5 border-r border-white/[0.06]">
                  <FeaturedAuditCard onClick={closeDropdown} />
                </div>
                {/* Resource links */}
                <div className="p-6">
                  <p className="px-4 pb-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Ressources
                  </p>
                  <div className="space-y-0.5">
                    {ressourcesItems.map((item) => (
                      <MegaLink
                        key={item.label}
                        item={item}
                        onClick={closeDropdown}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ──── Mobile Menu ──── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/[0.06]">
            <nav className="flex flex-col">
              {/* Accueil */}
              <Link
                to="/"
                className="py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={closeMobile}
              >
                Accueil
              </Link>

              {/* Solutions accordion */}
              <MobileAccordion label="Solutions">
                {solutionsItems.map((item) => (
                  <MegaLink
                    key={item.label}
                    item={item}
                    onClick={closeMobile}
                  />
                ))}
              </MobileAccordion>

              {/* Services accordion */}
              <MobileAccordion label="Services">
                {servicesItems.map((item) => (
                  <MegaLink
                    key={item.label}
                    item={item}
                    onClick={closeMobile}
                  />
                ))}
                <Link
                  to="/services"
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium text-primary hover:bg-white/[0.04] transition-colors"
                  onClick={closeMobile}
                >
                  Voir tous les services
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </MobileAccordion>

              {/* Ressources accordion */}
              <MobileAccordion label="Ressources">
                {[
                  { icon: Scan, label: "Tracking Checker", description: "Diagnostiquez votre site en 30s", href: "/audit-tracking" },
                  ...ressourcesItems,
                ].map((item) => (
                  <MegaLink
                    key={item.label}
                    item={item}
                    onClick={closeMobile}
                  />
                ))}
              </MobileAccordion>

              {/* Contact link */}
              <Link
                to="/contact"
                className="py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={closeMobile}
              >
                Contact
              </Link>

              {/* CTA mobile */}
              <Button
                variant="heroGradient"
                size="lg"
                className="w-full mt-4"
                asChild
              >
                <Link to="/contact" onClick={closeMobile}>
                  Réserver mon Audit Offert
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
