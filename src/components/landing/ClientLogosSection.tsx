const ClientLogosSection = () => {
  // Placeholder logos - à remplacer par les vrais logos clients
  const clientLogos = [
    { name: "Client 1", src: "/logos/client-1.png" },
    { name: "Client 2", src: "/logos/client-2.png" },
    { name: "Client 3", src: "/logos/client-3.png" },
    { name: "Client 4", src: "/logos/client-4.png" },
    { name: "Client 5", src: "/logos/client-5.png" },
    { name: "Client 6", src: "/logos/client-6.png" },
  ];

  return (
    <section className="py-16 md:py-24 bg-background border-t border-border/20">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground text-sm uppercase tracking-widest mb-12">
          Ils nous font confiance
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
                className="client-logo h-8 md:h-10 w-auto max-w-[120px] md:max-w-[140px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogosSection;
