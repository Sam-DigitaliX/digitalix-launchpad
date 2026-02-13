const ClientLogosSection = () => {
  // Placeholder logos - à remplacer par les vrais logos clients
  const clientLogos = [
    { name: "Bambuser", src: "/logos/Bambuser_logo_tr.png" },
    { name: "Métropole Grand Nancy", src: "/logos/MetropoleGrandNancy.png" },
    { name: "Ville de Nancy", src: "/logos/VilledeNancy.png" },
    { name: "Nestlé", src: "/logos/Nestle.png" },
    { name: "Purina One", src: "/logos/Purina-One.png" },
    { name: "Cosa", src: "/logos/logo-square-COSA.png" },
    { name: "Wamiz", src: "/logos/WamizClub.png" },
    { name: "NetOffensive", src: "/logos/NetOffensive.png" },
    { name: "Talents Digital", src: "/logos/logo-talents-digital.webp" },
    { name: "Talents Legal", src: "/logos/logo-talents-legal.webp" },
    { name: "Le Mage du SEA", src: "/logos/LeMageduSEA.png" },
    { name: "Prescient Studio", src: "/logos/PrescientStudio.png" },
    { name: "Ades Bootcamp", src: "/logos/ADESBOOTCAMP_Logo.png" },
    { name: "Be Langue", src: "/logos/Belangue.png" },
    { name: "CybershowParis", src: "/logos/CybershowParis.png" },
    { name: "Mprez", src: "/logos/mprez-logo.png" },
    { name: "FISE Montpellier", src: "/logos/FISE-montpellier.png" },
    { name: "Hotel Clement Ader", src: "/logos/HotelClementAder.png" },
    { name: "Hotel Saint Exupery", src: "/logos/HotelStExupery.png" },
    { name: "Réserver.fr", src: "/logos/Reserver.fr.png" },
    { name: "French Tax Online", src: "/logos/FTO.png" },
    { name: "Promo Assurances", src: "/logos/PromoAssurances.png" },
    { name: "Actiomservice", src: "/logos/Actiomservice.png" },
    { name: "Véritable Immobilier", src: "/logos/VeritableImmo.png" },
    { name: "RefBikes", src: "/logos/RefBikes.png" },
    { name: "Alpes Blanc", src: "/logos/AlpesBlanc.png" },
    { name: "Réseau Stan", src: "/logos/ReseauStan.png" },
    { name: "Vertigo Media Performance", src: "/logos/VertigoMedia.png" },
    { name: "AgenceSW", src: "/logos/AgenceSW.png" },
    { name: "La Nouvelle Equipe", src: "/logos/LNE-logo.png" },
    { name: "CosaVostra", src: "/logos/CosaVostra2.png" },
  ];

  return (
    <section className="relative py-16 md:py-24 bg-black/[0.6] backdrop-blur-xl border-t border-border/20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm uppercase tracking-widest mb-12 text-muted-foreground">
          <span className="text-gradient-primary">
            Ils nous font confiance
          </span>
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-14">
          {clientLogos.map((logo, index) => (
            <div
              key={index}
              className="client-logo-wrapper"
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="client-logo h-10 md:h-14 w-auto max-w-[160px] md:max-w-[200px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogosSection;
