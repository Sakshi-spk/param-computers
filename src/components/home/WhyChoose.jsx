import {
  ShieldCheck,
  BadgeCheck,
  Headphones,
  IndianRupee,
  Users,
  Wrench,
} from "lucide-react";

export default function WhyChoose() {
  const reasons = [
    {
      title: "Quality Assured",
      description:
        "Every product is carefully checked to deliver dependable performance and value.",
      icon: ShieldCheck,
    },
    {
      title: "Trusted Experience",
      description:
        "Years of experience helping customers find technology suited to their actual needs.",
      icon: BadgeCheck,
    },
    {
      title: "Expert Guidance",
      description:
        "Get practical recommendations instead of choosing technology without proper guidance.",
      icon: Users,
    },
    {
      title: "Value-Focused",
      description:
        "Smart technology choices that balance performance, reliability and your budget.",
      icon: IndianRupee,
    },
    {
      title: "After-Sales Support",
      description:
        "We're here to assist even after your purchase with dependable customer support.",
      icon: Headphones,
    },
    {
      title: "Technical Expertise",
      description:
        "Solutions backed by hands-on understanding of computers, infrastructure and technology.",
      icon: Wrench,
    },
  ];

  return (
    <section id="why-param" className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C6922F]">
            Why Param Computers
          </p>

          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-[#0F2B5B] sm:text-5xl">
            Technology Backed by Trust
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5B6F86] sm:text-lg">
            We focus on the things that matter most when choosing
            technology: quality, value, guidance and dependable support.
          </p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-3xl border border-[#E5EAF0] bg-[#E5EAF0] sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <div
                key={reason.title}
                className="min-h-[220px] bg-white p-7 transition hover:bg-[#F8FAFD]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5E9D6]">
                  <Icon
                    size={23}
                    strokeWidth={1.8}
                    className="text-[#8B6232]"
                  />
                </div>

                <h3 className="mt-6 text-xl font-bold leading-tight text-[#0F2B5B]">
                  {reason.title}
                </h3>

                <p className="mt-3 text-base leading-7 text-[#5B6F86]">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-[#E8E0D4] bg-[#FBFAF7] px-6 py-5 text-center sm:px-10">
          <p className="text-base font-medium leading-7 text-[#526174]">
            Choosing technology is easier when you have the right
            partner beside you.
          </p>
        </div>

      </div>
    </section>
  );
}