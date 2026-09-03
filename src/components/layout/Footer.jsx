import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  const productLinks = [
    "Refurbished Laptops",
    "Desktop Computers",
    "Projectors",
    "Digital Boards",
    "Printers",
    "Accessories",
  ];

  const quickLinks = [
    ["Home", "#"],
    ["Products", "#categories"],
    ["Solutions", "#services"],
    ["Brands", "#brands"],
    ["About", "#why-param"],
    ["Contact", "#contact"],
  ];

  return (
    <footer id="contact" className="bg-[#071B3A] text-white">

      {/* MAIN FOOTER */}
      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-8 lg:py-20">

        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">

          {/* BRAND */}
          <div className="max-w-sm">

            <div className="inline-flex rounded-2xl bg-white px-5 py-4">
              <img
                src="/param-logo-light.png"
                alt="Param Computers"
                className="h-auto w-[220px] max-w-full object-contain"
              />
            </div>

            <p className="mt-7 text-sm leading-7 text-[#B8C5D8]">
              Reliable technology solutions for businesses,
              institutions, schools and individuals. Quality
              products, practical guidance and dependable support.
            </p>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#D6DFEC]">
              <span className="h-2 w-2 rounded-full bg-[#C6922F]" />
              Trusted Technology Partner Since 2004
            </div>

          </div>

          {/* QUICK LINKS */}
          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C6922F]">
              Quick Links
            </h3>

            <ul className="mt-6 space-y-4">
              {quickLinks.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-[#C4CFDE] transition-colors hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

          </div>

          {/* PRODUCTS */}
          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C6922F]">
              Products
            </h3>

            <ul className="mt-6 space-y-4">
              {productLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#categories"
                    className="text-sm text-[#C4CFDE] transition-colors hover:text-white"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>

          </div>

          {/* CONTACT */}
          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C6922F]">
              Get In Touch
            </h3>

            <div className="mt-6 space-y-5">

              {/* PHONE */}
              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  <Phone
                    size={17}
                    className="text-[#7DB7FF]"
                  />
                </div>

                <div>
                  <p className="text-xs text-[#8192AA]">
                    Call Us
                  </p>

                  <a
                    href="tel:+919284480451"
                    className="mt-1 block text-sm font-medium text-white hover:text-[#7DB7FF]"
                  >
                    +91 92844 80451
                  </a>
                </div>

              </div>

              {/* EMAIL */}
              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  <Mail
                    size={17}
                    className="text-[#7DB7FF]"
                  />
                </div>

                <div>
                  <p className="text-xs text-[#8192AA]">
                    Email
                  </p>

                  <a
                    href="mailto:udaykharadkar@gmail.com"
                    className="mt-1 block break-all text-sm font-medium text-white hover:text-[#7DB7FF]"
                  >
                    udaykharadkar@gmail.com
                  </a>
                </div>

              </div>

              {/* ADDRESS */}
              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  <MapPin
                    size={17}
                    className="text-[#7DB7FF]"
                  />
                </div>

                <div>

                  <p className="text-xs text-[#8192AA]">
                    Location
                  </p>

                  <a
                    href="https://maps.google.com/maps?ftid=0x3bdc8be81a7617cf:0xe0621b1ccfbd53e"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm leading-6 text-white transition-colors hover:text-[#7DB7FF]"
                  >
                    Param Computers, Sanidhya Banglow,
                    <br />
                    Indiranagar, Shirasgaon Road,
                    <br />
                    Shrirampur, Ahmednagar – 413709
                  </a>

                  <a
                    href="https://maps.google.com/maps?ftid=0x3bdc8be81a7617cf:0xe0621b1ccfbd53e"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#C6922F] transition-colors hover:text-[#E0B24D]"
                  >
                    View on Google Maps
                    <ArrowUpRight size={13} />
                  </a>

                </div>

              </div>

            </div>

            {/* WHATSAPP */}
            <a
              href="https://wa.me/919284480451"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#C6922F] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:bg-[#B58120]"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
              <ArrowUpRight size={16} />
            </a>

          </div>

        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">

        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-center sm:px-8 md:flex-row md:text-left lg:px-8">

          <p className="text-xs text-[#8192AA]">
            © {new Date().getFullYear()} Param Computers. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs text-[#8192AA]">

            <a
              href="#"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="transition-colors hover:text-white"
            >
              Terms & Conditions
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}