import { useState, useCallback, useMemo } from "react";
import {
  getAdminStats,
  getAdminContacts,
  getAdminContactTimeline,
  getAdminContactAudits,
  getAdminEmailStats,
  getAdminContactEmails,
  type AdminContact,
  type AdminInteraction,
  type AdminStats,
  type AdminContactAudit,
  type AdminEmailStats,
  type AdminEmailLog,
  ApiError,
} from "@/lib/api";
import {
  Lock,
  Users,
  CheckCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  LogOut,
  Shield,
  Zap,
  Eye,
  Search,
  Mail,
  BarChart3,
  ExternalLink,
  Globe,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const INTERACTION_LABELS: Record<string, string> = {
  qualification_form: "Formulaire qualification",
  audit_unlock: "Audit d\u00e9bloqu\u00e9",
  audit_email_click: "Clic email audit",
  resource_download: "T\u00e9l\u00e9chargement ressource",
  email_sent: "Email envoy\u00e9",
};

function formatDate(iso: string | null) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string | null) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type SourceFilter = "all" | "audit" | "form" | "both";
type DateFilter = "all" | "7" | "30" | "90";

function ScoreBadge({ score, qualified }: { score: number | null; qualified: boolean | null }) {
  if (score == null) return <span className="text-muted-foreground text-xs">\u2014</span>;
  const color = qualified
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : "bg-orange-500/10 text-orange-400 border-orange-500/20";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${color}`}>
      {score}
      {qualified ? " \u00b7 Qualifi\u00e9" : " \u00b7 Non qualifi\u00e9"}
    </span>
  );
}

function TemperatureDot({ temperature }: { temperature: string }) {
  const config: Record<string, { color: string; label: string }> = {
    hot: { color: "bg-red-500", label: "Hot" },
    warm: { color: "bg-orange-400", label: "Warm" },
    cold: { color: "bg-blue-400", label: "Cold" },
  };
  const { color, label } = config[temperature] ?? config.cold;
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const label = INTERACTION_LABELS[type] ?? type;
  const colors: Record<string, string> = {
    qualification_form: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    audit_unlock: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    audit_email_click: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    resource_download: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    email_sent: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${colors[type] ?? "bg-glass text-muted-foreground border-glass-border"}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Metadata viewer                                                    */
/* ------------------------------------------------------------------ */

function MetadataGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => v != null && v !== "");
  if (entries.length === 0) return <span className="text-muted-foreground text-xs">Aucune donn\u00e9e</span>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
      {entries.map(([key, value]) => (
        <div key={key}>
          <span className="text-muted-foreground">{key.replace(/_/g, " ")}:</span>{" "}
          <span className="text-foreground font-medium">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact row with expandable timeline + audits + emails             */
/* ------------------------------------------------------------------ */

function ContactRow({ contact, adminKey }: { contact: AdminContact; adminKey: string }) {
  const [expanded, setExpanded] = useState(false);
  const [timeline, setTimeline] = useState<AdminInteraction[] | null>(null);
  const [audits, setAudits] = useState<AdminContactAudit[] | null>(null);
  const [emails, setEmails] = useState<AdminEmailLog[] | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDetails = useCallback(async () => {
    if (timeline) {
      setExpanded((e) => !e);
      return;
    }
    setLoading(true);
    try {
      const [timelineData, auditsData, emailsData] = await Promise.all([
        getAdminContactTimeline(adminKey, contact.id),
        getAdminContactAudits(adminKey, contact.id),
        getAdminContactEmails(adminKey, contact.id),
      ]);
      setTimeline(timelineData);
      setAudits(auditsData);
      setEmails(emailsData);
      setExpanded(true);
    } catch (err) {
      console.error('[Admin] Details load error:', err);
    }
    setLoading(false);
  }, [adminKey, contact.id, timeline]);

  return (
    <>
      <tr
        className="ev-table-row border-b border-glass-border/40 cursor-pointer group"
        onClick={loadDetails}
      >
        <td className="px-5 py-4">
          <TemperatureDot temperature={contact.lead_temperature} />
        </td>
        <td className="px-5 py-4">
          <div className="font-medium text-foreground">{contact.full_name ?? "\u2014"}</div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">{contact.email}</div>
        </td>
        <td className="px-5 py-4 text-sm text-muted-foreground">{contact.company_name ?? "\u2014"}</td>
        <td className="px-5 py-4 text-sm text-muted-foreground">{contact.profile_type ?? "\u2014"}</td>
        <td className="px-5 py-4">
          <ScoreBadge score={contact.qualification_score} qualified={contact.is_qualified} />
        </td>
        <td className="px-5 py-4 text-sm text-center text-muted-foreground font-mono">{contact.audit_count}</td>
        <td className="px-5 py-4 text-sm text-center text-muted-foreground font-mono">{contact.interaction_count}</td>
        <td className="px-5 py-4 text-sm text-muted-foreground">{formatDateShort(contact.last_seen_at)}</td>
        <td className="px-5 py-4 text-center">
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-primary/50 border-t-transparent rounded-full animate-spin" />
          ) : expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={9} className="px-5 py-5 bg-glass">
            <div className="space-y-6 pl-2">
              {/* Audits section */}
              {audits && audits.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display mb-3">
                    Audits \u00b7 {audits.length}
                  </h4>
                  <div className="space-y-2">
                    {audits.map((audit) => (
                      <div
                        key={audit.id}
                        className="flex items-center gap-4 pl-4 border-l border-violet-500/30 py-2"
                      >
                        <Globe className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                        <span className="text-sm text-foreground font-medium">{audit.domain}</span>
                        {audit.overall_score != null && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-glass border border-glass-border text-muted-foreground">
                            {audit.overall_score}/100
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatDateShort(audit.created_at)}</span>
                        <a
                          href={`/audit-tracking/resultats/${audit.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Voir <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emails section */}
              {emails && emails.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display mb-3">
                    Emails \u00b7 {emails.length}
                  </h4>
                  <div className="space-y-2">
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        className="flex items-center gap-4 pl-4 border-l border-teal-500/30 py-2"
                      >
                        <Mail className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        <span className="text-sm text-foreground">{email.subject ?? email.template_key}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          email.clicked_at
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : email.opened_at
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : "bg-glass text-muted-foreground border-glass-border"
                        }`}>
                          {email.clicked_at ? "Cliqu\u00e9" : email.opened_at ? "Ouvert" : "Envoy\u00e9"}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDateShort(email.sent_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactions timeline */}
              {timeline && timeline.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display mb-3">
                    Timeline \u00b7 {timeline.length} interaction{timeline.length > 1 ? "s" : ""}
                  </h4>
                  {timeline.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex items-start gap-4 pl-4 border-l border-primary/20 py-2"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <TypeBadge type={interaction.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1.5 font-mono">
                          {formatDate(interaction.created_at)}
                        </div>
                        <MetadataGrid data={interaction.metadata} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {timeline?.length === 0 && audits?.length === 0 && emails?.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune activit\u00e9 enregistr\u00e9e.</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats cards                                                        */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay: string;
}) {
  return (
    <div className={`ev-card-static p-6 ev-fade-in ${delay}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-bold text-foreground font-display ev-count-in">{value}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filters                                                            */
/* ------------------------------------------------------------------ */

function FilterBar({
  sourceFilter,
  setSourceFilter,
  dateFilter,
  setDateFilter,
}: {
  sourceFilter: SourceFilter;
  setSourceFilter: (f: SourceFilter) => void;
  dateFilter: DateFilter;
  setDateFilter: (f: DateFilter) => void;
}) {
  const sourceOptions: { value: SourceFilter; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "audit", label: "Audit" },
    { value: "form", label: "Formulaire" },
    { value: "both", label: "Les deux" },
  ];
  const dateOptions: { value: DateFilter; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "7", label: "7 jours" },
    { value: "30", label: "30 jours" },
    { value: "90", label: "90 jours" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Source</span>
        <div className="flex gap-1">
          {sourceOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSourceFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sourceFilter === opt.value
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-glass text-muted-foreground border border-glass-border hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">P\u00e9riode</span>
        <div className="flex gap-1">
          {dateOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                dateFilter === opt.value
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-glass text-muted-foreground border border-glass-border hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function Admin() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("dx_admin_key") ?? "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [emailStats, setEmailStats] = useState<AdminEmailStats | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    // Source filter
    if (sourceFilter === "audit") {
      filtered = filtered.filter((c) => c.interaction_types?.includes("audit_unlock"));
    } else if (sourceFilter === "form") {
      filtered = filtered.filter((c) => c.interaction_types?.includes("qualification_form"));
    } else if (sourceFilter === "both") {
      filtered = filtered.filter(
        (c) =>
          c.interaction_types?.includes("audit_unlock") &&
          c.interaction_types?.includes("qualification_form"),
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter((c) => new Date(c.last_seen_at) >= cutoff);
    }

    return filtered;
  }, [contacts, sourceFilter, dateFilter]);

  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      const [statsData, emailStatsData] = await Promise.all([
        getAdminStats(adminKey.trim()),
        getAdminEmailStats(adminKey.trim()),
      ]);
      setStats(statsData);
      setEmailStats(emailStatsData);
      sessionStorage.setItem("dx_admin_key", adminKey.trim());
      setIsAuthenticated(true);

      // Load contacts
      setDataLoading(true);
      const contactsData = await getAdminContacts(adminKey.trim());
      setContacts(contactsData);
      setDataLoading(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthError("Cl\u00e9 invalide.");
      } else {
        setAuthError("Erreur r\u00e9seau.");
      }
    }
    setAuthLoading(false);
  };

  const logout = () => {
    sessionStorage.removeItem("dx_admin_key");
    setIsAuthenticated(false);
    setAdminKey("");
    setContacts([]);
    setStats(null);
    setEmailStats(null);
  };

  /* ---- Login gate ---- */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background ev-mesh-bg ev-noise flex items-center justify-center p-4">
        {/* Dot grid overlay */}
        <div className="fixed inset-0 ev-dot-grid opacity-40 pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-[380px] ev-fade-in">
          {/* Card with animated gradient border */}
          <form onSubmit={authenticate} className="ev-card p-8 space-y-7">
            <div className="relative z-10">
              {/* Brand */}
              <div className="text-center space-y-4">
                <div className="inline-flex p-3.5 rounded-2xl bg-primary/10 border border-primary/20 ev-icon-pulse">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground font-display tracking-tight">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Entrez votre cl\u00e9 d'acc\u00e8s pour continuer
                  </p>
                </div>
              </div>

              {/* Input */}
              <div className="mt-7 space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Cl\u00e9 d'acc\u00e8s
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  className="w-full px-4 py-3 ev-input text-sm"
                  autoFocus
                />
              </div>

              {/* Error */}
              {authError && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-400/90 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-2.5">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {authError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={authLoading || !adminKey.trim()}
                className="w-full mt-6 py-3 ev-btn-primary text-sm font-bold"
              >
                {authLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    V\u00e9rification...
                  </span>
                ) : (
                  "Acc\u00e9der au dashboard"
                )}
              </button>

              {/* Footer hint */}
              <p className="text-center text-[11px] text-muted-foreground/50 mt-5">
                Acc\u00e8s restreint \u00b7 DigitaliX Admin
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ---- Dashboard ---- */
  return (
    <div className="min-h-screen bg-background ev-mesh-bg ev-noise">
      {/* Dot grid */}
      <div className="fixed inset-0 ev-dot-grid opacity-30 pointer-events-none z-0" />

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-glass-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-display tracking-tight">
                DigitaliX Admin
              </h1>
              <p className="text-[11px] text-muted-foreground">Dashboard</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-glass"
          >
            <LogOut className="w-3.5 h-3.5" />
            D\u00e9connexion
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats row 1 — Contacts & Interactions */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Contacts"
              value={stats.total_contacts}
              color="bg-primary/10 text-primary"
              delay="ev-fade-in-delay-1"
            />
            <StatCard
              icon={CheckCircle}
              label="Qualifi\u00e9s"
              value={stats.qualified_count}
              color="bg-emerald-500/10 text-emerald-400"
              delay="ev-fade-in-delay-2"
            />
            <StatCard
              icon={Activity}
              label="Interactions"
              value={stats.total_interactions}
              color="bg-secondary/10 text-secondary"
              delay="ev-fade-in-delay-3"
            />
            <StatCard
              icon={Eye}
              label="Aujourd'hui"
              value={stats.interactions_today}
              color="bg-violet-500/10 text-violet-400"
              delay="ev-fade-in-delay-4"
            />
          </div>
        )}

        {/* Stats row 2 — Audits & Emails */}
        {(stats || emailStats) && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Search}
              label="Audits"
              value={stats?.total_audits ?? 0}
              color="bg-violet-500/10 text-violet-400"
              delay="ev-fade-in-delay-1"
            />
            <StatCard
              icon={BarChart3}
              label="Score moyen"
              value={stats?.avg_audit_score ?? "\u2014"}
              color="bg-indigo-500/10 text-indigo-400"
              delay="ev-fade-in-delay-2"
            />
            <StatCard
              icon={Mail}
              label="Emails envoy\u00e9s"
              value={emailStats?.total_sent ?? 0}
              color="bg-teal-500/10 text-teal-400"
              delay="ev-fade-in-delay-3"
            />
            <StatCard
              icon={Eye}
              label="Taux d'ouverture"
              value={emailStats ? `${emailStats.open_rate}%` : "\u2014"}
              color="bg-sky-500/10 text-sky-400"
              delay="ev-fade-in-delay-4"
            />
          </div>
        )}

        {/* Contacts table */}
        <div className="ev-card ev-fade-in overflow-hidden">
          <div className="relative z-10">
            <div className="px-6 py-5 border-b border-glass-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-foreground font-display text-sm">
                    Contacts
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Cliquez sur une ligne pour voir le d\u00e9tail
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-glass px-3 py-1.5 rounded-lg border border-glass-border">
                  {filteredContacts.length}{filteredContacts.length !== contacts.length && ` / ${contacts.length}`}
                </span>
              </div>
              <FilterBar
                sourceFilter={sourceFilter}
                setSourceFilter={setSourceFilter}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
              />
            </div>

            {dataLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="inline-block w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">Chargement des contacts...</span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-8 h-8 text-muted mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {contacts.length === 0 ? "Aucun contact pour l'instant." : "Aucun contact ne correspond aux filtres."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest w-20">Temp.</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Contact</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Entreprise</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Profil</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Score</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest text-center">Audits</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest text-center">Actions</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Derni\u00e8re visite</th>
                      <th className="px-5 py-3.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <ContactRow key={contact.id} contact={contact} adminKey={adminKey} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
