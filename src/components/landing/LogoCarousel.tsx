const clientLogos = [
  { name: "Bambuser", src: "/logos/Bambuser_logo_tr.png" },
  { name: "Métropole Grand Nancy", src: "/logos/MetropoleGrandNancy.png" },
  { name: "Ville de Nancy", src: "/logos/VilledeNancy.png" },
  { name: "Nestlé", src: "/logos/Nestle.png" },
  { name: "Purina One", src: "/logos/Purina-One.png" },
  { name: "Cosa", src: "/logos/logo-square-COSA.png" },
  { name: "CosaVostra", src: "/logos/CosaVostra2.png" },
  { name: "Wamiz", src: "/logos/WamizClub.png" },
  { name: "NetOffensive", src: "/logos/NetOffensive.png" },
  { name: "Talents Digital", src: "/logos/logo-talents-digital.webp" },
  { name: "Talents Legal", src: "/logos/logo-talents-legal.webp" },
  { name: "Le Mage du SEA", src: "/logos/LeMageduSEA.png" },
  { name: "Prescient Studio", src: "/logos/PrescientStudio.png" },
  { name: "Ades Bootcamp", src: "/logos/ADESBOOTCAMP_Logo.png" },
  { name: "Be Langue", src: "/logos/Belangue.png" },
  { name: "CybershowParis", src: "/logos/CybershowParis.png" },
  { name: "Actiomservice", src: "/logos/Actiomservice.png" },
  { name: "Agence SW", src: "/logos/AgenceSW.png" },
  { name: "Alpes Blanc", src: "/logos/AlpesBlanc.png" },
  { name: "FISE Montpellier", src: "/logos/FISE-montpellier.png" },
  { name: "FTO", src: "/logos/FTO.png" },
  { name: "Hotel Clément Ader", src: "/logos/HotelClementAder.png" },
  { name: "Hotel St Exupéry", src: "/logos/HotelStExupery.png" },
  { name: "LNE", src: "/logos/LNE-logo.png" },
  { name: "Promo Assurances", src: "/logos/PromoAssurances.png" },
  { name: "Ref Bikes", src: "/logos/RefBikes.png" },
  { name: "Réseau Stan", src: "/logos/ReseauStan.png" },
  { name: "Thermoclima Est", src: "/logos/Thermoclima-est.webp" },
  { name: "Vertigo Media", src: "/logos/VertigoMedia.png" },
  { name: "Mprez", src: "/logos/mprez-logo.png" },
  { name: "Réserver.fr", src: "/logos/Reserver.fr.png" },
  { name: "Véritable Immo", src: "/logos/VeritableImmo.png" },
];

const LogoCarousel = () => {
  return (
    <div className="relative w-full overflow-hidden min-h-[56px] h-14 sm:min-h-[64px] sm:h-16 md:min-h-[80px] md:h-20">
      {/* Fade edges - smaller on mobile */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      {/* Scrolling track - duplicate logos for seamless infinite loop */}
      <div className="flex items-center justify-start h-full logo-scroll-track">
        {[...clientLogos, ...clientLogos].map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-3 sm:mx-5 md:mx-8"
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="h-8 sm:h-9 md:h-10 w-auto max-w-[90px] sm:max-w-[100px] md:max-w-[120px] object-contain brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoCarousel;
