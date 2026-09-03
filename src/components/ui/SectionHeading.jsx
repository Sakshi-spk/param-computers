export default function SectionHeading({
  badge,
  title,
  description,
}) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">

      <p className="uppercase tracking-[4px] text-[#B08D57] font-semibold text-sm">
        {badge}
      </p>

      <h2 className="mt-4 text-4xl lg:text-5xl font-bold text-[#2D1F1A]">
        {title}
      </h2>

      <p className="mt-6 text-gray-600 leading-8">
        {description}
      </p>

    </div>
  );
}