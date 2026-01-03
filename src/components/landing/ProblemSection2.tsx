import React from "react";
import ServerSideImage from "@/public/Server-side tagging.png"; // Import direct depuis src/public/
import AdblockIcon from "@/assets/icon-adblock.png";
import PrivacyIcon from "@/assets/icon-privacy.png";
import AlgoIcon from "@/assets/icon-algorythm.png";

const ProblemSection = () => {
  return (
    <section className="py-20 bg-card relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Titre principal */}
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center animate-fade-in-up">
          Votre tracking client-side vous fait perdre{" "}
          <span className="text-gradient-primary">30% de vos conversions</span>. Voici pourquoi.
        </h2>
        <p className="text-xl text-muted-foreground mb-16 max-w-3xl mx-auto text-center animate-fade-in-up animation-delay-100">
          iOS 17, les AdBlockers et le RGPD rendent votre tracking actuel{" "}
          <span className="font-semibold">inefficace et coûteux</span>. Voici comment le server-side résout ces problèmes.
        </p>

        {/* Cartes des problèmes (inchangées) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Carte 1 : Ad-Blockers & ITP */}
          <div className="glass-card p-6 border-glass-border animate-scale-in animation-delay-200">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                {/* Glow */}
                <span className="absolute inset-0 rounded-full blur-lg bg-primary/30 opacity-70" />
            
                {/* Icon */}
                <img
                  src={AdblockIcon}
                  alt="Ad blockers & ITP"
                  className="relative z-10 h-16 w-16 object-contain"
                />
              </div>
            </div>
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
            <div className="mb-4 flex justify-center">
              <div className="relative">
                {/* Glow */}
                <span className="absolute inset-0 rounded-full blur-lg bg-primary/30 opacity-70" />
            
                {/* Icon */}
                <img
                  src={AlgoIcon}
                  alt="Algo aveugle"
                  className="relative z-10 h-16 w-16 object-contain"
                />
              </div>
            </div>
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
            <div className="mb-4 flex justify-center">
              <div className="relative">
                {/* Glow */}
                <span className="absolute inset-0 rounded-full blur-lg bg-primary/30 opacity-70" />
            
                {/* Icon */}
                <img
                  src={PrivacyIcon}
                  alt="Dépendance Cookie"
                  className="relative z-10 h-16 w-16 object-contain"
                />
              </div>
            </div>
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

        {/* Solution avec TON IMAGE PNG */}
        <div className="glass-card p-8 md:p-12 border-glass-border glow-primary mb-12 animate-fade-in-up animation-delay-500">
          <div className="flex flex-col items-center gap-8">
            <h3 className="text-3xl font-bold text-foreground mb-4 text-center">
              Le server-side est la <span className="text-gradient-primary">seule solution fiable</span>
            </h3>

            {/* Intégration de ton PNG */}
            <div className="flex justify-center w-full">
              <img
                src="/Server-side tagging.png"  // Chemin relatif depuis public/
                alt="Schéma du server-side tagging"
                className="w-full max-w-2xl h-auto"
              />
            </div>

            {/* Liste des avantages */}
            <ul className="space-y-3 text-muted-foreground mb-6 text-center md:text-left">
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-primary">✅</span> Contourne <span className="font-semibold">100% des bloqueurs</span>
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-primary">✅</span> <span className="font-semibold">99.9% de précision</span> sur vos données
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-primary">✅</span> Alimente vos algorithmes avec des <span className="font-semibold">données complètes</span>
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-primary">✅</span> <span className="font-semibold">100% conforme RGPD</span>
              </li>
            </ul>

            {/* Résultat */}
            <p className="text-lg text-foreground/80 text-center">
              Résultat : Des campagnes <span className="font-bold text-secondary">plus rentables</span> et des décisions basées sur des
              <span className="font-bold">données fiables</span>.
            </p>
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
          <span className="text-xl font-bold text-foreground">Intégrations :</span>
          <div className="flex gap-8 items-center">
            <span className="text-3xl text-blue-500">📊</span>
            <span className="text-3xl text-red-500">🔍</span>
            <span className="text-3xl text-green-500">☁️</span>
            <span className="text-3xl text-orange-500">📦</span>
            <span className="text-3xl text-blue-400">🔗</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
