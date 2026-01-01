import React from "react";

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

        {/* Cartes des problèmes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Cartes identiques à la version 1 */}
          {/* ... (même code que ci-dessus) ... */}
        </div>

        {/* Solution avec flux de données */}
        <div className="glass-card p-8 md:p-12 border-glass-border glow-primary mb-12 animate-fade-in-up animation-delay-500">
          <div className="flex flex-col items-center gap-8">
            <h3 className="text-3xl font-bold text-foreground mb-4 text-center">
              Le server-side est la <span className="text-gradient-primary">seule solution fiable</span>
            </h3>

            {/* Flux de données */}
            <div className="w-full max-w-2xl">
              <svg width="500" height="250" viewBox="0 0 500 250" className="w-full h-auto">
                {/* Client */}
                <rect x="50" y="120" width="80" height="60" rx="10" fill="#374151" />
                <text x="90" y="160" textAnchor="middle" className="text-sm font-bold fill-white">Client</text>

                {/* Serveur */}
                <rect x="370" y="120" width="80" height="60" rx="10" fill="#3b82f6" />
                <text x="410" y="160" textAnchor="middle" className="text-sm font-bold fill-white">Serveur</text>

                {/* Plateformes */}
                <rect x="200" y="30" width="100" height="60" rx="10" fill="#10b981" />
                <text x="250" y="70" textAnchor="middle" className="text-sm font-bold fill-white">Plateformes</text>

                {/* Flux Client-Side (rouge) */}
                <path d="M130 150 L200 50" stroke="#ef4444" strokeWidth="2" strokeDasharray="5, 2" fill="none" />
                <text x="180" y="90" textAnchor="middle" className="text-xs font-bold fill-red-400">30% perdu</text>

                {/* Flux Server-Side (bleu) */}
                <path d="M130 150 L370 150 L430 50" stroke="#3b82f6" strokeWidth="2" fill="none" />
                <text x="300" y="140" textAnchor="middle" className="text-xs font-bold fill-blue-400">100% récupéré</text>

                {/* Légende */}
                <text x="250" y="230" textAnchor="middle" className="text-sm fill-white">
                  Le server-side <span className="text-gradient-primary">contourne les bloqueurs</span> et récupère toutes vos données.
                </text>
              </svg>
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
