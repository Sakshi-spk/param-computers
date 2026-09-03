import {
  Laptop,
  Network,
  Printer,
  Settings,
  GraduationCap,
  MonitorSmartphone,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function Services() {
  const navigate = useNavigate();

  const services = [
    {
      title: "Computer Solutions",
      slug: "computer-solutions",
      description:
        "Reliable laptops and desktop solutions for everyday work, business and professional use.",
      icon: Laptop,
    },
    {
      title: "Networking Solutions",
      slug: "networking-solutions",
      description:
        "Structured networking solutions designed for reliable connectivity across your workspace.",
      icon: Network,
    },
    {
      title: "Smart Classroom",
      slug: "smart-classroom",
      description:
        "Interactive digital boards and technology solutions for modern classrooms and institutions.",
      icon: GraduationCap,
    },
    {
      title: "Printing Solutions",
      slug: "printing-solutions",
      description:
        "Printers and printing solutions for offices, schools, businesses and everyday requirements.",
      icon: Printer,
    },
    {
      title: "IT Infrastructure",
      slug: "it-infrastructure",
      description:
        "Practical technology infrastructure designed around the needs of your organization.",
      icon: MonitorSmartphone,
    },
    {
      title: "Technical Support",
      slug: "technical-support",
      description:
        "Dependable assistance to help keep your technology running smoothly.",
      icon: Settings,
    },
  ];

  function handleLearnMore(service) {
    navigate(
      "/services/" + service.slug
    );
  }

  return (
    <section
      id="services"
      className="bg-[#F7FAFE]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">

        {/* HEADER */}
        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C6922F]">
            Our Services
          </p>

          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-[#0F2B5B] sm:text-5xl">
            Complete Technology Solutions
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5B6F86] sm:text-lg">
            From computing and networking to smart classrooms and
            technical support, we help you build a reliable
            technology environment.
          </p>

        </div>

        {/* SERVICES */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {services.map((service) => {

            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="group relative flex min-h-[270px] flex-col overflow-hidden rounded-3xl border border-[#E3E9F1] bg-white p-7 shadow-[0_4px_20px_rgba(15,43,91,0.04)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(15,43,91,0.10)]"
              >

                {/* DECORATION */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-50 transition duration-300 group-hover:scale-150" />

                {/* ICON */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FF] transition duration-300 group-hover:bg-[#0F2B5B]">

                  <Icon
                    size={27}
                    strokeWidth={1.8}
                    className="text-[#2563EB] transition group-hover:text-white"
                  />

                </div>

                {/* TITLE */}
                <h3 className="relative mt-6 text-2xl font-bold leading-tight text-[#0F2B5B]">
                  {service.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="relative mt-3 text-base leading-7 text-[#5B6F86]">
                  {service.description}
                </p>

                {/* LEARN MORE */}
                <div className="relative mt-auto pt-6">

                  <button
                    type="button"
                    onClick={() =>
                      handleLearnMore(service)
                    }
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] transition duration-300 hover:gap-3 hover:text-[#C6922F]"
                  >
                    Learn More

                    <ArrowUpRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </button>

                </div>

              </article>
            );

          })}

        </div>

      </div>
    </section>
  );
}