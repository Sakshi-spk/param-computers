import {
  Laptop,
  Monitor,
  Projector,
  Tv,
  Zap,
  Cable,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    title: "Laptops",
    subtitle: "Dell • HP • Lenovo • Apple",
    icon: Laptop,
  },
  {
    title: "Desktops",
    subtitle: "Business & Home PCs",
    icon: Monitor,
  },
  {
    title: "Projectors",
    subtitle: "LED • Android • WiFi",
    icon: Projector,
  },
  {
    title: "Digital Boards",
    subtitle: "Interactive Teaching",
    icon: Tv,
  },
  {
    title: "SSD Upgrades",
    subtitle: "Faster Performance",
    icon: Zap,
  },
  {
    title: "Accessories",
    subtitle: "HDMI • VGA • LAN • USB",
    icon: Cable,
  },
];

export default function ProductCategories() {
  return (
    <section className="bg-white py-20 lg:py-24">

      {/* Header */}
      <div className="mx-auto w-full max-w-7xl px-6 text-center lg:px-8">

        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C6922F]">
          Our Products
        </p>

        <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-bold leading-[1.15] text-[#0F2B5B] sm:text-5xl">
          Browse By Category
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5B6F86] sm:text-lg">
          Premium refurbished systems and IT accessories for
          homes, schools, colleges and businesses.
        </p>

      </div>

      {/* Cards */}
      <div className="mx-auto mt-14 grid w-full max-w-7xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">

        {categories.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="group flex min-h-[245px] flex-col rounded-3xl border border-[#E8E0D4] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#D8C29A] hover:shadow-[0_20px_45px_rgba(15,43,91,0.10)]"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5E9D6] transition-all duration-300 group-hover:bg-[#0F2B5B]">
                <Icon
                  size={28}
                  strokeWidth={1.8}
                  className="text-[#8B6232] transition-colors duration-300 group-hover:text-white"
                />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-[#0F2B5B]">
                {item.title}
              </h3>

              <p className="mt-2 text-base leading-7 text-[#5B6F86]">
                {item.subtitle}
              </p>

              <div className="mt-auto pt-6">
                <button className="inline-flex items-center gap-2 font-semibold text-[#C6922F] transition-all duration-300 group-hover:gap-3">
                  View Products
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>

            </div>
          );
        })}

      </div>
    </section>
  );
}