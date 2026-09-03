export default function Brands() {
  const brands = [
    {
      name: "Dell",
      logo: "https://cdn.simpleicons.org/dell/0F2B5B",
    },
    {
      name: "HP",
      logo: "https://cdn.simpleicons.org/hp/0F2B5B",
    },
    {
      name: "Lenovo",
      logo: "https://cdn.simpleicons.org/lenovo/0F2B5B",
    },
    {
      name: "Apple",
      logo: "https://cdn.simpleicons.org/apple/0F2B5B",
    },
    {
      name: "Acer",
      logo: "https://cdn.simpleicons.org/acer/0F2B5B",
    },
    {
      name: "ASUS",
      logo: "https://cdn.simpleicons.org/asus/0F2B5B",
    },
    {
      name: "LG",
      logo: "https://cdn.simpleicons.org/lg/0F2B5B",
    },
    {
      name: "Samsung",
      logo: "https://cdn.simpleicons.org/samsung/0F2B5B",
    },
    {
      name: "ViewSonic",
      logo: "/viewsonic.png",
    },
    {
      name: "Epson",
      logo: "https://cdn.simpleicons.org/epson/0F2B5B",
    },
    {
      name: "Sony",
      logo: "https://cdn.simpleicons.org/sony/0F2B5B",
    },
  ];

  return (
    <section
      id="brands"
      className="bg-[#FBF9F6]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">

        {/* SECTION HEADER */}

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C6922F]">
            Trusted Brands
          </p>

          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-[#0F2B5B] sm:text-5xl">
            Brands You Can Count On
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5B6F86] sm:text-lg">
            We work with leading technology brands to bring you
            dependable products and trusted choices.
          </p>

        </div>

        {/* BRAND LOGOS */}

        <div className="mt-12 flex flex-wrap justify-center gap-4">

          {brands.map((brand) => (
            <div
              key={brand.name}
              className="group flex h-24 w-[calc(50%-0.5rem)] items-center justify-center rounded-2xl border border-[#E3E8EE] bg-white px-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D7E1EF] hover:shadow-lg sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(16.666%-0.833rem)]"
            >
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                className="h-10 w-[130px] object-contain opacity-75 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
              />
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}