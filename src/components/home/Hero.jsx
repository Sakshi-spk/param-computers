import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7FAFE]">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-yellow-100/40 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-16">

          {/* LEFT */}
          <div className="max-w-[650px]">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-semibold text-[#2563EB] shadow-sm">
              🇮🇳 Trusted Technology Partner Since 2004
            </div>

            <h1 className="mt-7 text-[48px] font-extrabold leading-[1.02] tracking-[-0.035em] text-[#0F2B5B] sm:text-[58px] lg:text-[68px]">
              Premium{" "}
              <span className="text-[#C6922F]">
                Technology
              </span>
              <br />
              Solutions For
              <br />
              Modern Businesses
            </h1>

            <p className="mt-7 max-w-[610px] text-base leading-7 text-[#5B6F86] sm:text-lg">
              Param Computers delivers premium refurbished laptops,
              desktops, projectors, digital boards, networking products,
              printers and complete IT infrastructure solutions for
              schools, businesses and institutions across India.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#categories"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-1 hover:bg-[#1D4ED8]"
              >
                Explore Products
                <ArrowRight size={19} />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center rounded-xl border-2 border-[#2563EB] bg-white px-7 py-3.5 font-semibold text-[#2563EB] transition hover:-translate-y-1 hover:bg-[#2563EB] hover:text-white"
              >
                Contact Us
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
              {[
                "Quality Tested",
                "Pan India Delivery",
                "Warranty Support",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-[#5B6F86]"
                >
                  <CheckCircle2
                    size={18}
                    className="text-[#C6922F]"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative mx-auto w-full max-w-[590px]">
            <div className="absolute -inset-5 rounded-[45px] bg-gradient-to-r from-blue-200/40 via-transparent to-yellow-100/50 blur-2xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-white bg-white p-2 shadow-[0_25px_70px_rgba(15,43,91,0.15)]">
              <img
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200"
                alt="Premium laptop technology"
                className="h-[420px] w-full rounded-[26px] object-cover sm:h-[470px] lg:h-[500px]"
              />

              <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/20 bg-[#0F2B5B]/95 px-5 py-4 shadow-xl backdrop-blur-sm sm:left-9 sm:right-9">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#C6922F]">
                      Param Computers
                    </p>

                    <p className="mt-1 text-base font-bold text-white sm:text-lg">
                      Reliable Technology. Better Value.
                    </p>
                  </div>

                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#C6922F]/40 bg-[#C6922F]/10 sm:flex">
                    <span className="text-lg">⚙️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}