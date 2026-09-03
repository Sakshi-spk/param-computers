import {
  Laptop,
  Monitor,
  Projector,
  Tv,
  Printer,
  Cable,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function Categories() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Refurbished Laptops",
      description: "Dell, HP, Lenovo, Apple & more",
      icon: Laptop,
    },
    {
      title: "Desktop Computers",
      description: "Business & Home Desktop PCs",
      icon: Monitor,
    },
    {
      title: "Projectors",
      description: "Office, School & Home Projectors",
      icon: Projector,
    },
    {
      title: "Digital Boards",
      description: "Interactive Smart Classroom Solutions",
      icon: Tv,
    },
    {
      title: "Printers",
      description: "Inkjet, Laser & Multifunction Printers",
      icon: Printer,
    },
    {
      title: "Accessories",
      description: "Cables, SSDs, Networking & More",
      icon: Cable,
    },
  ];

  /*
   * ============================================================
   * OPEN CATEGORY
   * ============================================================
   */

  function openCategory(category) {
    navigate(
      `/products?category=${encodeURIComponent(
        category
      )}`
    );
  }

  return (
    <section
      id="categories"
      className="bg-[#FBF9F6]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">

        {/* =====================================================
            SECTION HEADER
        ====================================================== */}

        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">

          <p className="text-center text-sm font-semibold uppercase tracking-[0.35em] text-[#C6922F]">
            Our Categories
          </p>

          <h2 className="mx-auto mt-3 w-full text-center text-4xl font-bold leading-[1.15] tracking-tight text-[#0F2B5B] sm:text-5xl">
            Technology Solutions for Every Need
          </h2>

          <p className="mx-auto mt-5 w-full max-w-2xl text-center text-base leading-7 text-[#5B6F86] sm:text-lg">
            Explore our wide range of premium computers,
            accessories and IT solutions.
          </p>

        </div>

        {/* =====================================================
            CATEGORY CARDS
        ====================================================== */}

        <div className="mx-auto mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <article
                key={category.title}
                onClick={() =>
                  openCategory(category.title)
                }
                className="
                  group
                  relative
                  flex
                  min-h-[255px]
                  cursor-pointer
                  flex-col
                  overflow-hidden
                  rounded-3xl
                  border
                  border-[#E5E8ED]
                  bg-white
                  p-7
                  shadow-[0_4px_20px_rgba(15,43,91,0.04)]
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:border-[#C9D8EC]
                  hover:shadow-[0_22px_50px_rgba(15,43,91,0.11)]
                "
              >

                {/* Decorative Corner Glow */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-12
                    -top-12
                    h-32
                    w-32
                    rounded-full
                    bg-[#EEF4FF]
                    opacity-80
                    transition-all
                    duration-500
                    group-hover:scale-[1.7]
                    group-hover:bg-[#E3EEFF]
                  "
                />

                {/* =================================================
                    ICON
                ================================================== */}

                <div
                  className="
                    relative
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#E6D5B8]
                    bg-[#F8F0E3]
                    transition-all
                    duration-300
                    group-hover:border-[#0F2B5B]
                    group-hover:bg-[#0F2B5B]
                  "
                >
                  <Icon
                    size={27}
                    strokeWidth={1.8}
                    className="
                      text-[#8B6232]
                      transition-colors
                      duration-300
                      group-hover:text-white
                    "
                  />
                </div>

                {/* =================================================
                    CONTENT
                ================================================== */}

                <div className="relative">

                  <h3
                    className="
                      mt-6
                      text-2xl
                      font-bold
                      leading-tight
                      tracking-tight
                      text-[#0F2B5B]
                    "
                  >
                    {category.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      max-w-[280px]
                      text-base
                      leading-7
                      text-[#5B6F86]
                    "
                  >
                    {category.description}
                  </p>

                </div>

                {/* =================================================
                    CTA
                ================================================== */}

                <div className="relative mt-auto pt-7">

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openCategory(
                        category.title
                      );
                    }}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      font-semibold
                      text-[#2563EB]
                      transition-all
                      duration-300
                      group-hover:gap-3
                    "
                  >
                    Explore Category

                    <ArrowUpRight
                      size={17}
                      strokeWidth={2}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </button>

                </div>

                {/* Bottom Accent */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-7
                    h-[2px]
                    w-0
                    bg-[#C6922F]
                    transition-all
                    duration-300
                    group-hover:w-16
                  "
                />

              </article>
            );
          })}

        </div>

      </div>
    </section>
  );
}