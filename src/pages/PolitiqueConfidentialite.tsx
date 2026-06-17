import Header from "@/components/landing/Header";
import EvervaultGlow from "@/components/landing/EvervaultGlow";
import Footer from "@/components/landing/Footer";
import { useNoIndex } from "@/hooks/useNoIndex";

const LAST_UPDATED = "17 juin 2026";

const PolitiqueConfidentialite = () => {
  useNoIndex();

  return (
    <div className="min-h-screen bg-background">
      <EvervaultGlow />
      <Header />
      <main className="relative z-[1] pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Politique de confidentialité
            </h1>
            <p className="text-sm text-muted-foreground font-mono mb-12">
              Dernière mise à jour : {LAST_UPDATED}
            </p>

            <div className="space-y-10 text-muted-foreground leading-relaxed">
              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Responsable du traitement</h2>
                <p>
                  Le responsable du traitement des données est{" "}
                  <span className="text-foreground">Samuel Marangé</span> (Entreprise individuelle,
                  nom commercial DigitaliX), 166 rue du bois de grève, 54710 Ludres, France.
                </p>
                <p>
                  Pour toute question relative à vos données personnelles :{" "}
                  <a
                    href="mailto:privacy@digitalix.xyz"
                    className="text-foreground underline hover:text-primary transition-colors"
                  >
                    privacy@digitalix.xyz
                  </a>
                  .
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Données collectées</h2>
                <p>Selon votre interaction avec le site, nous collectons :</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="text-foreground">Audit tracking</span> : l'adresse e-mail que
                    vous renseignez pour débloquer votre rapport, ainsi que l'URL du site analysé.
                  </li>
                  <li>
                    <span className="text-foreground">Formulaire de qualification / contact</span> :
                    e-mail et les informations que vous fournissez sur votre projet (profil,
                    besoins, situation, budget, échéance).
                  </li>
                  <li>
                    <span className="text-foreground">Données d'usage</span> : pages consultées et
                    interactions, collectées via nos outils de mesure d'audience après recueil de
                    votre consentement.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Finalités & bases légales</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Réalisation de l'audit tracking et envoi du rapport — base légale :{" "}
                    <span className="text-foreground">consentement</span>.
                  </li>
                  <li>
                    Qualification et suivi commercial des demandes — base légale :{" "}
                    <span className="text-foreground">intérêt légitime</span> (prospection B2B) ou
                    mesures précontractuelles à votre demande.
                  </li>
                  <li>
                    Mesure d'audience et amélioration du site — base légale :{" "}
                    <span className="text-foreground">consentement</span> (via la bannière de
                    cookies).
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Destinataires & sous-traitants</h2>
                <p>
                  Vos données ne sont jamais revendues. Elles sont traitées par DigitaliX et par les
                  sous-traitants techniques strictement nécessaires au service :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="text-foreground">Resend</span> (envoi d'e-mails transactionnels)
                  </li>
                  <li>
                    <span className="text-foreground">Vercel</span> (hébergement du site)
                  </li>
                  <li>
                    <span className="text-foreground">Hostinger</span> (hébergement de l'API et de la
                    base de données)
                  </li>
                  <li>
                    <span className="text-foreground">Didomi</span> (gestion du consentement)
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Transferts hors Union européenne</h2>
                <p>
                  Certains sous-traitants (Vercel, Resend) sont établis aux États-Unis. Les
                  transferts éventuels sont encadrés par des garanties appropriées au sens du RGPD
                  (clauses contractuelles types de la Commission européenne et/ou adhésion au
                  EU-U.S. Data Privacy Framework).
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Durée de conservation</h2>
                <p>
                  Les données des prospects sont conservées pendant{" "}
                  <span className="text-foreground">3 ans</span> à compter de notre dernier contact
                  resté sans suite, conformément aux recommandations de la CNIL en matière de
                  prospection commerciale. Au-delà, elles sont supprimées ou anonymisées.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Cookies & traceurs</h2>
                <p>
                  Le site utilise Google Tag Manager et des outils de mesure d'audience pilotés via
                  le Consent Mode v2 de Google. Aucun cookie de mesure ou publicitaire n'est déposé
                  avant votre consentement, recueilli via notre plateforme de gestion du
                  consentement (CMP) Didomi.
                </p>
                <p>
                  Vous pouvez modifier ou retirer vos choix à tout moment via le lien{" "}
                  <span className="text-foreground">« Consent choices »</span> présent en pied de
                  page.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Vos droits</h2>
                <p>
                  Conformément au RGPD, vous disposez d'un droit d'accès, de rectification,
                  d'effacement, d'opposition, de limitation et de portabilité de vos données, ainsi
                  que du droit de retirer votre consentement à tout moment. Pour exercer ces droits,
                  écrivez à{" "}
                  <a
                    href="mailto:privacy@digitalix.xyz"
                    className="text-foreground underline hover:text-primary transition-colors"
                  >
                    privacy@digitalix.xyz
                  </a>
                  .
                </p>
                <p>
                  Vous pouvez également introduire une réclamation auprès de la CNIL (
                  <a
                    href="https://www.cnil.fr"
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground underline hover:text-primary transition-colors"
                  >
                    cnil.fr
                  </a>
                  ).
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

export default PolitiqueConfidentialite;
