import Header from "@/components/landing/Header";
import EvervaultGlow from "@/components/landing/EvervaultGlow";
import Footer from "@/components/landing/Footer";

const LAST_UPDATED = "17 juin 2026";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-background">
      <EvervaultGlow />
      <Header />
      <main className="relative z-[1] pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Mentions légales
            </h1>
            <p className="text-sm text-muted-foreground font-mono mb-12">
              Dernière mise à jour : {LAST_UPDATED}
            </p>

            <div className="space-y-10 text-muted-foreground leading-relaxed">
              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Éditeur du site</h2>
                <p>
                  Le site <strong className="text-foreground">digitalix.xyz</strong> est édité par :
                </p>
                <ul className="space-y-1">
                  <li>
                    <span className="text-foreground">Samuel Marangé</span> — Entreprise individuelle (EI)
                  </li>
                  <li>Nom commercial : DigitaliX</li>
                  <li>166 rue du bois de grève, 54710 Ludres, France</li>
                  <li>SIREN : 849 349 253</li>
                  <li>SIRET : 849 349 253 00013</li>
                  <li>N° TVA intracommunautaire : FR70 849349253</li>
                  <li>
                    Contact :{" "}
                    <a
                      href="mailto:privacy@digitalix.xyz"
                      className="text-foreground underline hover:text-primary transition-colors"
                    >
                      privacy@digitalix.xyz
                    </a>
                  </li>
                  <li>Téléphone : +33 6 62 31 16 58</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Directeur de la publication</h2>
                <p>Samuel Marangé.</p>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Hébergement</h2>
                <p>Le site (front-end) est hébergé par :</p>
                <ul className="space-y-1">
                  <li>
                    <span className="text-foreground">Vercel Inc.</span> — 440 N Barranca Ave #4133,
                    Covina, CA 91723, États-Unis
                  </li>
                  <li>
                    <a
                      href="https://vercel.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-foreground underline hover:text-primary transition-colors"
                    >
                      vercel.com
                    </a>
                  </li>
                </ul>
                <p>
                  L'infrastructure applicative (API et base de données) est hébergée par :
                </p>
                <ul className="space-y-1">
                  <li>
                    <span className="text-foreground">Hostinger International Ltd</span> — 61 Lordou
                    Vironos Street, 6023 Larnaca, Chypre
                  </li>
                  <li>
                    <a
                      href="https://www.hostinger.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-foreground underline hover:text-primary transition-colors"
                    >
                      hostinger.com
                    </a>
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Propriété intellectuelle</h2>
                <p>
                  L'ensemble des contenus présents sur le site (textes, visuels, logos, charte
                  graphique, code) est la propriété exclusive de DigitaliX, sauf mention contraire.
                  Toute reproduction, représentation ou diffusion, totale ou partielle, sans
                  autorisation écrite préalable est interdite et constitue une contrefaçon au sens
                  des articles L.335-2 et suivants du Code de la propriété intellectuelle.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Responsabilité</h2>
                <p>
                  DigitaliX s'efforce d'assurer l'exactitude des informations publiées sur le site
                  mais ne saurait être tenu responsable des erreurs, omissions ou indisponibilités.
                  Les liens externes pointant vers des sites tiers n'engagent pas la responsabilité
                  de DigitaliX quant à leur contenu.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Données personnelles & cookies</h2>
                <p>
                  Le traitement de vos données personnelles et l'usage des cookies sont détaillés
                  dans notre{" "}
                  <a
                    href="/politique-de-confidentialite"
                    className="text-foreground underline hover:text-primary transition-colors"
                  >
                    politique de confidentialité
                  </a>
                  . Vous pouvez modifier vos choix de consentement à tout moment via le lien
                  « Consent choices » présent en pied de page.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MentionsLegales;
