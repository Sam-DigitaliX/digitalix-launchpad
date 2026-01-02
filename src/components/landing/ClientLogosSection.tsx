const ClientLogosSection = () => {
  // Placeholder logos - à remplacer par les vrais logos clients
  const clientLogos = [
    { name: "Bambuser", src: "/logos/Bambuser_logo_tr.png" },
    { name: "Métropole Grand Nancy", src: "/logos/Logo_Métropole_Grand_Nancy.webp" },
    { name: "Ville de Nancy", src: "/logos/Logo_Nancy_désaturé.webp" },
    { name: "Nestlé", src: "/logos/Nestlé_OSW_logo.png" },
    { name: "Purina One", src: "/logos/purina-logo.png" },
    { name: "Cosa", src: "/logos/logo-square-COSA.png" },
    { name: "Wamiz", src: "/logos/Wamiz-logo.png" },
    { name: "NetOffensive", src: "/logos/Netoffensive-logo.png" },
    { name: "Talents Digital", src: "/logos/logo-talents-digital.webp" },
    { name: "Talents Legal", src: "/logos/logo-talents-legal.webp" },
  ];

  return (
    <section className="py-16 md:py-24 bg-background border-t border-border/20">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm uppercase tracking-widest mb-12 text-muted-foreground">
          <span className="text-gradient-primary">
            Ils nous font confiance
          </span>
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
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
