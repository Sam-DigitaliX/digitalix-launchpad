import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase";
import { Lock, Users, CheckCircle, Activity, ChevronDown, ChevronUp, LogOut } from "lucide-react";

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
  if (score == null) return <span className="text-muted-foreground text-sm">—</span>;
  const color = qualified
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : "bg-orange-500/20 text-orange-400 border-orange-500/30";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {score}
      {qualified ? " — Qualifié" : " — Non qualifié"}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const label = INTERACTION_LABELS[type] ?? type;
  const colors: Record<string, string> = {
    qualification_form: "bg-primary/20 text-primary border-primary/30",
    audit_unlock: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    resource_download: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${colors[type] ?? "bg-muted text-muted-foreground border-border"}`}>
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs">
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
        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={loadTimeline}
      >
        <td className="px-4 py-3">
          <div className="font-medium text-foreground">{contact.full_name ?? "—"}</div>
          <div className="text-xs text-muted-foreground">{contact.email}</div>
        </td>
        <td className="px-4 py-3 text-sm">{contact.company_name ?? "—"}</td>
        <td className="px-4 py-3 text-sm">{contact.profile_type ?? "—"}</td>
        <td className="px-4 py-3">
          <ScoreBadge score={contact.qualification_score} qualified={contact.is_qualified} />
        </td>
        <td className="px-4 py-3 text-sm text-center">{contact.interaction_count}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(contact.last_seen_at)}</td>
        <td className="px-4 py-3 text-center">
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </td>
      </tr>
      {expanded && timeline && (
        <tr>
          <td colSpan={7} className="px-4 py-4 bg-muted/20">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Timeline ({timeline.length} interaction{timeline.length > 1 ? "s" : ""})
              </h4>
              {timeline.map((interaction) => (
                <div
                  key={interaction.id}
                  className="flex items-start gap-3 pl-4 border-l-2 border-primary/30"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <TypeBadge type={interaction.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">
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

function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${accent ?? "bg-primary/20"}`}>
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={authenticate} className="glass-card p-8 w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="inline-flex p-3 rounded-xl bg-primary/20 mb-3">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Entrez votre clé d'accès</p>
          </div>

          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Clé admin..."
            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />

          {authError && <p className="text-sm text-red-400">{authError}</p>}

          <button
            type="submit"
            disabled={authLoading || !adminKey.trim()}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {authLoading ? "Vérification..." : "Accéder"}
          </button>
        </form>
      </div>
    );
  }

  /* ---- Dashboard ---- */
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">DigitaliX — Admin</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Contacts" value={stats.total_contacts} />
            <StatCard icon={CheckCircle} label="Qualifiés" value={stats.qualified_count} accent="bg-emerald-500/20" />
            <StatCard icon={Activity} label="Interactions" value={stats.total_interactions} />
            <StatCard icon={Activity} label="Aujourd'hui" value={stats.interactions_today} accent="bg-violet-500/20" />
          </div>
        )}

        {/* Contacts table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">
              Contacts ({contacts.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cliquez sur une ligne pour voir la timeline
            </p>
          </div>

          {dataLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              Aucun contact pour l'instant.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Entreprise</th>
                    <th className="px-4 py-3 font-medium">Profil</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium text-center">Actions</th>
                    <th className="px-4 py-3 font-medium">Dernière visite</th>
                    <th className="px-4 py-3 font-medium w-10"></th>
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
  );
}
