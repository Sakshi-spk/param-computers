import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Phone,
  Wrench,
} from "lucide-react";

const WHATSAPP_NUMBER = "919284480451";
const PHONE_NUMBER = "+919284480451";

const services = {
  "computer-solutions": {
    title: "Computer Solutions",
    description:
      "Reliable computer solutions for businesses, offices, schools and individuals.",
    points: [
      "Refurbished laptops and desktops",
      "Business computer setups",
      "RAM and SSD upgrades",
      "System upgrades and configuration",
      "Computer recommendations based on your requirements",
    ],
  },

  "networking-solutions": {
    title: "Networking Solutions",
    description:
      "Structured networking solutions designed for reliable connectivity across your workspace.",
    points: [
      "LAN networking",
      "Wi-Fi setup",
      "Router and switch configuration",
      "Office networking",
      "Network troubleshooting and support",
    ],
  },

  "smart-classroom": {
    title: "Smart Classroom",
    description:
      "Interactive digital boards and technology solutions for modern classrooms and institutions.",
    points: [
      "Interactive digital boards",
      "Projector solutions",
      "Classroom technology setup",
      "Installation assistance",
      "Technical support",
    ],
  },

  "printing-solutions": {
    title: "Printing Solutions",
    description:
      "Printers and printing solutions for offices, schools, businesses and everyday requirements.",
    points: [
      "Inkjet printers",
      "Laser printers",
      "Multifunction printers",
      "Printer setup",
      "Printing support",
    ],
  },

  "it-infrastructure": {
    title: "IT Infrastructure",
    description:
      "Practical technology infrastructure designed around the needs of your organization.",
    points: [
      "Computer infrastructure",
      "Networking infrastructure",
      "Office technology setup",
      "Hardware planning",
      "Infrastructure support",
    ],
  },

  "technical-support": {
    title: "Technical Support",
    description:
      "Dependable assistance to help keep your technology running smoothly.",
    points: [
      "Computer troubleshooting",
      "Hardware assistance",
      "Networking troubleshooting",
      "System configuration",
      "After-sales technical support",
    ],
  },
};

export default function ServiceDetails() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const service = services[slug];

  function handleWhatsApp() {
    if (!service) {
      return;
    }

    const message = encodeURIComponent(
      `Hello Param Computers, I am interested in your ${service.title}. Please provide more information.`
    );

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleCall() {
    window.location.href = `tel:${PHONE_NUMBER}`;
  }

  if (!service) {
    return (
      <section className="min-h-screen bg-[#FBF9F6] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EEF3FA] text-[#0F2B5B]">
            <Wrench size={34} />
          </div>

          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.35em] text-[#C6922F]">
            Param Computers
          </p>

          <h1 className="mt-3 text-4xl font-bold text-[#0F2B5B]">
            Service Not Found
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#718096]">
            The service you are looking for could not be found.
            Please return to our services section and choose a
            service from the available options.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0F2B5B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#17396F]"
          >
            <ArrowLeft size={17} />
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FBF9F6]">
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-20">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] transition hover:text-[#0F2B5B]"
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>

        {/* MAIN CARD */}

        <div className="mt-10 overflow-hidden rounded-3xl border border-[#E3E9F1] bg-white shadow-[0_10px_40px_rgba(15,43,91,0.05)]">

          {/* HEADER */}

          <div className="bg-[#0F2B5B] px-8 py-10 sm:px-12 sm:py-12">

            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C6922F]">
              Param Computers
            </p>

            <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
              {service.title}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-blue-100 sm:text-lg sm:leading-8">
              {service.description}
            </p>

          </div>

          {/* CONTENT */}

          <div className="p-8 sm:p-12">

            <h2 className="text-2xl font-bold text-[#0F2B5B]">
              What We Offer
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {service.points.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border border-[#E8EDF4] bg-[#F8FAFD] p-5 transition hover:border-[#C6922F]"
                >
                  <CheckCircle2
                    size={21}
                    className="mt-0.5 shrink-0 text-[#C6922F]"
                  />

                  <span className="text-sm font-medium leading-6 text-[#344054]">
                    {point}
                  </span>
                </div>
              ))}

            </div>

            {/* CONTACT SECTION */}

            <div className="mt-10 rounded-2xl bg-[#F7FAFE] p-6 sm:p-7">

              <h2 className="text-xl font-bold text-[#0F2B5B]">
                Need This Solution?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#718096]">
                Contact Param Computers and tell us what you need.
                We will help you choose the right solution for your
                requirements.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                {/* WHATSAPP */}

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#17396F]"
                >
                  <MessageCircle size={18} />
                  Enquire on WhatsApp
                </button>

                {/* CALL */}

                <button
                  type="button"
                  onClick={handleCall}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8E1ED] bg-white px-6 py-3.5 text-sm font-semibold text-[#0F2B5B] transition hover:border-[#0F2B5B]"
                >
                  <Phone size={18} />
                  Call Now
                </button>

                {/* PRODUCTS */}

                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8E1ED] bg-white px-6 py-3.5 text-sm font-semibold text-[#0F2B5B] transition hover:border-[#C6922F] hover:text-[#C6922F]"
                >
                  Explore Products
                </button>

              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}