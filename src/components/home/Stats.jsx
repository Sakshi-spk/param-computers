import {
  Award,
  Globe2,
  ShieldCheck,
  Users,
} from "lucide-react";

const stats = [
  {
    icon: Award,
    number: "20+",
    title: "Years Experience",
  },
  {
    icon: Users,
    number: "1000+",
    title: "Happy Customers",
  },
  {
    icon: Globe2,
    number: "Pan India",
    title: "Delivery",
  },
  {
    icon: ShieldCheck,
    number: "100%",
    title: "Quality Tested",
  },
];

export default function Stats() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-[#E5EAF0] bg-[#FAF8F5] p-8 text-center transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4E9D7]">
                    <Icon size={30} className="text-[#8B5E34]" />
                  </div>
                </div>

                <h3 className="mt-6 text-4xl font-bold text-[#0F2B5B]">
                  {item.number}
                </h3>

                <p className="mt-2 text-sm font-medium text-[#5B6F86]">
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}