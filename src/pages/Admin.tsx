import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase";
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
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Contact {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  profile_type: string | null;
  qualification_score: number | null;
  is_qualified: boolean | null;
  behavioral_profile: string | null;
  gdpr_consent: boolean | null;
  newsletter_optin: boolean | null;
  first_seen_at: string;
  last_seen_at: string;
  interaction_count: number;
  interaction_types: string[] | null;
  last_interaction_at: string | null;
}

interface Interaction {
  id: string;
  type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Stats {
  total_contacts: number;
  qualified_count: number;
  total_interactions: number;
  interactions_today: number;
  top_interaction_type: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const INTERACTION_LABELS: Record<string, string> = {
  qualification_form: "Formulaire qualification",
  audit_unlock: "Audit débloqué",
  resource_download: "Téléchargement ressource",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ScoreBadge({ score, qualified }: { score: number | null; qualified: boolean | null }) {
  if (score == null) return <span className="text-muted-foreground text-xs">—</span>;
  const color = qualified
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : "bg-orange-500/10 text-orange-400 border-orange-500/20";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${color}`}>
      {score}
      {qualified ? " · Qualifié" : " · Non qualifié"}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const label = INTERACTION_LABELS[type] ?? type;
  const colors: Record<string, string> = {
    qualification_form: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    audit_unlock: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    resource_download: "bg-sky-500/10 text-sky-400 border-sky-500/20",
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
  if (entries.length === 0) return <span className="text-muted-foreground text-xs">Aucune donnée</span>;
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
/*  Contact row with expandable timeline                               */
/* ------------------------------------------------------------------ */

function ContactRow({ contact, adminKey }: { contact: Contact; adminKey: string }) {
  const [expanded, setExpanded] = useState(false);
  const [timeline, setTimeline] = useState<Interaction[] | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTimeline = useCallback(async () => {
    if (timeline) {
      setExpanded((e) => !e);
      return;
    }
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_get_contact_timeline", {
      p_key: adminKey,
      p_contact_id: contact.id,
    });
    if (!error && data) {
      setTimeline(data as Interaction[]);
      setExpanded(true);
    }
    setLoading(false);
  }, [adminKey, contact.id, timeline]);

  return (
    <>
      <tr
        className="ev-table-row border-b border-glass-border/40 cursor-pointer group"
        onClick={loadTimeline}
      >
        <td className="px-5 py-4">
          <div className="font-medium text-foreground">{contact.full_name ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">{contact.email}</div>
        </td>
        <td className="px-5 py-4 text-sm text-muted-foreground">{contact.company_name ?? "—"}</td>
        <td className="px-5 py-4 text-sm text-muted-foreground">{contact.profile_type ?? "—"}</td>
        <td className="px-5 py-4">
          <ScoreBadge score={contact.qualification_score} qualified={contact.is_qualified} />
        </td>
        <td className="px-5 py-4 text-sm text-center text-muted-foreground font-mono">{contact.interaction_count}</td>
        <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(contact.last_seen_at)}</td>
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
      {expanded && timeline && (
        <tr>
          <td colSpan={7} className="px-5 py-5 bg-glass">
            <div className="space-y-4 pl-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
                Timeline · {timeline.length} interaction{timeline.length > 1 ? "s" : ""}
              </h4>
              {timeline.map((interaction) => (
                <div
                  key={interaction.id}
                  className="flex items-start gap-4 pl-4 border-l border-primary/20"
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
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function Admin() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("dx_admin_key") ?? "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !adminKey.trim()) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      const { data, error } = await supabase.rpc("admin_get_stats", { p_key: adminKey.trim() });
      if (error) {
        setAuthError("Clé invalide ou fonctions admin non configurées.");
        setAuthLoading(false);
        return;
      }
      const statsRow = Array.isArray(data) ? data[0] : data;
      setStats(statsRow as Stats);
      sessionStorage.setItem("dx_admin_key", adminKey.trim());
      setIsAuthenticated(true);

      // Load contacts
      setDataLoading(true);
      const { data: contactsData } = await supabase.rpc("admin_get_contacts", { p_key: adminKey.trim() });
      if (contactsData) setContacts(contactsData as Contact[]);
      setDataLoading(false);
    } catch {
      setAuthError("Erreur réseau.");
    }
    setAuthLoading(false);
  };

  const logout = () => {
    sessionStorage.removeItem("dx_admin_key");
    setIsAuthenticated(false);
    setAdminKey("");
    setContacts([]);
    setStats(null);
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
                    Entrez votre clé d'accès pour continuer
                  </p>
                </div>
              </div>

              {/* Input */}
              <div className="mt-7 space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Clé d'accès
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="••••••••••••••••"
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
                    Vérification...
                  </span>
                ) : (
                  "Accéder au dashboard"
                )}
              </button>

              {/* Footer hint */}
              <p className="text-center text-[11px] text-muted-foreground/50 mt-5">
                Accès restreint · DigitaliX Admin
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
            Déconnexion
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
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
              label="Qualifiés"
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

        {/* Contacts table */}
        <div className="ev-card ev-fade-in overflow-hidden">
          <div className="relative z-10">
            <div className="px-6 py-5 border-b border-glass-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-foreground font-display text-sm">
                    Contacts
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Cliquez sur une ligne pour voir la timeline
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-glass px-3 py-1.5 rounded-lg border border-glass-border">
                  {contacts.length}
                </span>
              </div>
            </div>

            {dataLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="inline-block w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">Chargement des contacts...</span>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-8 h-8 text-muted mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucun contact pour l'instant.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Contact</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Entreprise</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Profil</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Score</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest text-center">Actions</th>
                      <th className="px-5 py-3.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Dernière visite</th>
                      <th className="px-5 py-3.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
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
