import {
  MapPin,
  Phone,
  Mail,
  Navigation,
} from "lucide-react";

export default function Contact() {
  // Exact location from your Google Maps link
  const latitude = 19.6169424;
  const longitude = 74.6806737;

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <section id="contact" className="bg-[#F7FAFE]">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">

        {/* SECTION HEADER */}
        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C6922F]">
            Contact Us
          </p>

          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-[#0F2B5B] sm:text-5xl">
            Visit Param Computers
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5B6F86] sm:text-lg">
            Looking for the right technology solution?
            Get in touch with us or visit our location.
          </p>

        </div>

        {/* CONTACT CARD */}
        <div className="mt-12 grid overflow-hidden rounded-3xl border border-[#E3E9F1] bg-white shadow-[0_15px_45px_rgba(15,43,91,0.08)] lg:grid-cols-[1.05fr_1fr]">

          {/* MAP */}
<a
  href={directionsUrl}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Open Param Computers location in Google Maps"
  className="group relative block min-h-[380px] bg-[#E8EEF5] lg:min-h-[520px]"
>
  <iframe
    title="Param Computers Location"
    src={`https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`}
    className="pointer-events-none h-full min-h-[380px] w-full border-0 lg:min-h-[520px]"
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  />

  {/* Click overlay */}
  <div className="absolute inset-0 flex items-end justify-center bg-transparent pb-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
    <span className="rounded-full bg-[#0F2B5B] px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
      Open in Google Maps ↗
    </span>
  </div>
</a>

          {/* DETAILS */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">

            {/* BUSINESS */}
            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6922F]">
                Param Computers
              </p>

              <h3 className="mt-3 text-3xl font-bold text-[#0F2B5B]">
                Let's Connect
              </h3>

              <p className="mt-4 text-base leading-7 text-[#5B6F86]">
                We're here to help you choose reliable technology
                that fits your requirements and budget.
              </p>

            </div>

            {/* LOCATION */}
            <div className="mt-8 flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8F0E3]">
                <MapPin
                  size={20}
                  className="text-[#8B6232]"
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-[#0F2B5B]">
                  Our Location
                </p>

                <p className="mt-1 text-sm leading-6 text-[#5B6F86]">
                   Param Computers,Sanidhya Banglow,
                  <br />
                  Indiranagar, Shirasgaon Road,
                  <br />
                  Shrirampur, Ahmednagar – 413709
                </p>

              </div>

            </div>

            {/* PHONE */}
            <div className="mt-6 flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF]">
                <Phone
                  size={20}
                  className="text-[#2563EB]"
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-[#0F2B5B]">
                  Call Us
                </p>

                <a
                  href="tel:+919284480451"
                  className="mt-1 block text-sm text-[#5B6F86] transition hover:text-[#2563EB]"
                >
                  +91 92844 80451
                </a>

              </div>

            </div>

            {/* EMAIL */}
            <div className="mt-6 flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF]">
                <Mail
                  size={20}
                  className="text-[#2563EB]"
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-[#0F2B5B]">
                  Email Us
                </p>

                <a
                  href="mailto:udaykharadkar@gmail.com"
                  className="mt-1 block break-all text-sm text-[#5B6F86] transition hover:text-[#2563EB]"
                >
                  udaykharadkar@gmail.com
                </a>

              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-9 flex flex-wrap gap-3">

              {/* GOOGLE MAPS */}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B5B] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-1 hover:bg-[#17396F]"
              >
                <Navigation size={17} />
                Get Directions
              </a>

              {/* CALL */}
              <a
                href="tel:+919284480451"
                className="inline-flex items-center gap-2 rounded-xl border border-[#D8E0EA] bg-white px-6 py-3.5 text-sm font-semibold text-[#334155] transition hover:-translate-y-1 hover:border-[#C6922F] hover:text-[#C6922F]"
              >
                <Phone size={17} />
                Call Now
              </a>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}