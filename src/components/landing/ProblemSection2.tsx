import React from "react";

const ProblemSection = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Titre principal */}
        <h2 className="text-5xl font-bold text-gradient-primary mb-6 animate-fade-in-up">
          Votre tracking client-side vous fait perdre{" "}
          <span className="text-destructive">30% de vos conversions</span>. Voici pourquoi.
        </h2>
        <p className="text-xl text-muted-foreground mb-16 max-w-3xl animate-fade-in-up animation-delay-100">
          iOS 17, les AdBlockers et le RGPD rendent votre tracking actuel{" "}
          <span className="font-semibold">inefficace et coûteux</span>. Voici comment le server-side résout ces problèmes.
        </p>

        {/* Cartes des problèmes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Carte 1 : Ad-Blockers & ITP */}
          <div className="glass-card p-6 border-glass-border animate-scale-in animation-delay-200">
            <div className="text-4xl mb-4 text-destructive">🛡️</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Ad-Blockers & ITP</h3>
            <p className="text-muted-foreground mb-4">
              Les bloqueurs et restrictions (iOS 17, AdBlockers){" "}
              <span className="font-semibold">suppriment jusqu’à 30% de vos données</span>.
            </p>
            <div className="h-2 bg-destructive/30 rounded-full w-full">
              <div className="h-full bg-destructive rounded-full" style={{ width: "30%" }}></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">30% de données <span className="font-semibold">perdues</span></p>
          </div>

          {/* Carte 2 : Algos Aveugles */}
          <div className="glass-card p-6 border-glass-border animate-scale-in animation-delay-300">
            <div className="text-4xl mb-4 text-secondary">🤖</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Algos Aveugles</h3>
            <p className="text-muted-foreground mb-4">
              Vos algorithmes publicitaires{" "}
              <span className="font-semibold">dépensent votre budget au hasard</span> sans données complètes.
            </p>
            <p className="text-sm text-secondary mt-2">
              Exemple : Un client a <span className="font-bold">réduit son CPA de 20%</span> après notre intervention.
            </p>
          </div>

          {/* Carte 3 : Dépendance Cookie */}
          <div className="glass-card p-6 border-glass-border animate-scale-in animation-delay-400">
            <div className="text-4xl mb-4">🍪❌</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Fin des Cookies Tiers</h3>
            <p className="text-muted-foreground mb-4">
              Le RGPD et la disparition des cookies tiers rendent votre tracking{" "}
              <span className="font-semibold">obsolète</span>.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Solution : <span className="font-bold text-primary">First-Party Data</span> avec le server-side.
            </p>
          </div>
        </div>

        {/* Solution */}
        <div className="glass-card p-8 md:p-12 border-glass-border glow-primary mb-12 animate-fade-in-up animation-delay-500">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Le server-side est la <span className="text-gradient-primary">seule solution fiable</span>
              </h3>
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✅</span> Contourne{" "}
                  <span className="font-semibold">100% des bloqueurs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✅</span>{" "}
                  <span className="font-semibold">99.9% de précision</span> sur vos données
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✅</span> Alimente vos algorithmes avec des{" "}
                  <span className="font-semibold">données complètes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✅</span>{" "}
                  <span className="font-semibold">100% conforme RGPD</span>
                </li>
              </ul>
              <p className="text-lg text-foreground/80 mb-6">
                Résultat : Des campagnes{" "}
                <span className="font-bold text-secondary">plus rentables</span> et des décisions basées sur des{" "}
                <span className="font-bold">données fiables</span>.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              {/* Schéma comparatif */}
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-primary/10 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">Client-Side</div>
                    <div className="text-5xl font-bold text-destructive mb-4">30%</div>
                    <div className="text-sm text-muted-foreground">Données<br />perdues</div>
                  </div>
                </div>
                <div className="absolute -right-8 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border-4 border-primary/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary mb-2">Server-Side</div>
                    <div className="text-5xl font-bold text-secondary mb-4">100%</div>
                    <div className="text-sm text-muted-foreground">Données<br />récupérées</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center animate-fade-in-up animation-delay-600">
          <a
            href="#audit"
            className="inline-block bg-gradient-cta text-foreground font-bold py-4 px-10 rounded-full glow-primary hover:glow-secondary transition-all transform hover:scale-105"
          >
            Je veux un audit gratuit de mon tracking →
          </a>
        </div>

        {/* Intégrations */}
        <div className="flex justify-center gap-12 mt-16 opacity-60 animate-fade-in-up animation-delay-700">
          <span className="text-2xl font-bold text-foreground">Intégrations :</span>
          <div className="flex gap-8 items-center">
            <span className="text-3xl text-blue-500">📊</span>
            <span className="text-3xl text-red-500">🔍</span>
            <span className="text-3xl text-green-500">☁️</span>
            <span className="text-3xl text-orange-500">📦</span>
            <span className="text-3xl text-blue-400">🔗</span>
          </div>
        </div>
      </div>

      {/* Animation de fond */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-primary to-secondary animate-data-flow"></div>
      </div>
    </section>
  );
};

export default ProblemSection;
