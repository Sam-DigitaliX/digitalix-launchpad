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

const ressourcesLeft = [
  { icon: BookOpen, label: "Blog", description: "Articles & insights", href: "#" },
  { icon: FileText, label: "Guides", description: "Ressources téléchargeables", href: "#" },
  { icon: Video, label: "Webinaires", description: "Sessions live & replays", href: "#" },
];

const ressourcesRight = [
  { icon: Scan, label: "Tracking Checker", description: "Diagnostiquez votre site en 30s", href: "/audit-tracking" },
  { icon: HelpCircle, label: "FAQ", description: "Questions fréquentes", href: "/#faq" },
  { icon: MessageSquare, label: "Contact", description: "Parlons de votre projet", href: "/contact" },
];

/* ──────────────────────── Dropdown Link ──────────────────────── */

interface DropdownItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
  comingSoon?: boolean;
}

const DropdownLink = ({
  item,
  onClick,
}: {
  item: DropdownItem;
  onClick?: () => void;
}) => {
  const inner = (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors duration-200 ${item.comingSoon ? "opacity-50 cursor-default" : "hover:bg-white/[0.06]"}`}>
      <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
        <item.icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{item.label}</span>
          {item.comingSoon && (
            <span className="text-[10px] font-medium text-muted-foreground bg-white/[0.06] px-1.5 py-0.5 rounded">Bientôt</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
      </div>
      {!item.comingSoon && <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />}
    </div>
  );

  if (item.comingSoon) return <div>{inner}</div>;

  return (
    <Link to={item.href} onClick={onClick}>
      {inner}
    </Link>
  );
};

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
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
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

  const isPathActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const triggerClass = (id: string, activePaths: string[]) => {
    const isActive = activePaths.some((p) => isPathActive(p)) || openDropdown === id;
    return `flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-white/[0.08] text-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;
  };

  const closeDropdown = () => setOpenDropdown(null);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        (isScrolled || isMobileMenuOpen)
          ? "backdrop-blur-xl border-b border-white/[0.06]"
          : "border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
          <nav className="relative hidden lg:flex items-center rounded-full border border-white/[0.12] bg-white/[0.07] px-1 py-1">
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
              onClick={() => (openDropdown === "solutions" ? closeDropdown() : openNav("solutions"))}
            >
              Solutions
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === "solutions" ? "rotate-180" : ""}`} />
            </button>

            {/* Services trigger */}
            <button
              type="button"
              className={triggerClass("services", ["/services"])}
              onMouseEnter={() => openNav("services")}
              onMouseLeave={scheduleClose}
              onClick={() => (openDropdown === "services" ? closeDropdown() : openNav("services"))}
            >
              Services
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === "services" ? "rotate-180" : ""}`} />
            </button>

            {/* Ressources trigger */}
            <button
              type="button"
              className={triggerClass("ressources", ["/audit-tracking"])}
              onMouseEnter={() => openNav("ressources")}
              onMouseLeave={scheduleClose}
              onClick={() => (openDropdown === "ressources" ? closeDropdown() : openNav("ressources"))}
            >
              Ressources
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === "ressources" ? "rotate-180" : ""}`} />
            </button>

            {/* ──── Shared Dropdown Panel ──── */}
            <div
              className={`absolute top-full left-0 right-0 pt-2 z-50 transition-all duration-200 ${
                openDropdown
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="rounded-2xl border border-white/[0.08] bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Solutions */}
                {openDropdown === "solutions" && (
                  <div className="p-3 grid grid-cols-3 gap-1">
                    {solutionsItems.map((item) => (
                      <DropdownLink
                        key={item.label}
                        item={item}
                        onClick={closeDropdown}
                      />
                    ))}
                  </div>
                )}

                {/* Services */}
                {openDropdown === "services" && (
                  <div>
                    <div className="p-3 grid grid-cols-3 gap-1">
                      {servicesItems.map((item) => (
                        <DropdownLink
                          key={item.label}
                          item={item}
                          onClick={closeDropdown}
                        />
                      ))}
                    </div>
                    <div className="border-t border-white/[0.06] px-5 py-3">
                      <Link
                        to="/services"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        onClick={closeDropdown}
                      >
                        Voir tous les services
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Ressources */}
                {openDropdown === "ressources" && (
                  <div className="grid grid-cols-2">
                    <div className="p-3 border-r border-white/[0.06]">
                      <p className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Apprendre
                      </p>
                      {ressourcesLeft.map((item) => (
                        <DropdownLink
                          key={item.label}
                          item={item}
                          onClick={closeDropdown}
                        />
                      ))}
                    </div>
                    <div className="p-3">
                      <p className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Outils
                      </p>
                      {ressourcesRight.map((item) => (
                        <DropdownLink
                          key={item.label}
                          item={item}
                          onClick={closeDropdown}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                  <DropdownLink key={item.label} item={item} onClick={closeMobile} />
                ))}
              </MobileAccordion>

              {/* Services accordion */}
              <MobileAccordion label="Services">
                {servicesItems.map((item) => (
                  <DropdownLink key={item.label} item={item} onClick={closeMobile} />
                ))}
                <Link
                  to="/services"
                  className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium text-primary hover:bg-white/[0.06] transition-colors"
                  onClick={closeMobile}
                >
                  Voir tous les services
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </MobileAccordion>

              {/* Ressources accordion */}
              <MobileAccordion label="Ressources">
                {[...ressourcesLeft, ...ressourcesRight].map((item) => (
                  <DropdownLink key={item.label} item={item} onClick={closeMobile} />
                ))}
              </MobileAccordion>

              {/* CTA mobile */}
              <Button variant="heroGradient" size="lg" className="w-full mt-4" asChild>
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
