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
];

const LogoCarousel = () => {
  return (
    <div className="relative w-full max-w-3xl mx-auto overflow-hidden h-16 md:h-20">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      {/* Scrolling track */}
      <div className="flex items-center h-full animate-scroll-left">
        {/* Duplicate logos for seamless loop */}
        {[...clientLogos, ...clientLogos].map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-6 md:mx-8"
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="client-logo h-8 md:h-10 w-auto max-w-[100px] md:max-w-[120px] object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoCarousel;
