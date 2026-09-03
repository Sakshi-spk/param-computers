import { Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductSearchBar() {
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const search = formData.get("search")?.trim();

    if (search) {
      navigate(
        `/products?search=${encodeURIComponent(search)}`
      );
    } else {
      navigate("/products");
    }
  }

  function handleFilter() {
    navigate("/products");
  }

  return (
    <section className="w-full overflow-x-hidden bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-5 lg:px-8">

        <div className="flex w-full items-center gap-3 rounded-2xl border border-[#E3E9F1] bg-white p-3 shadow-sm">

          {/* SEARCH */}

          <form
            onSubmit={handleSearch}
            className="flex min-w-0 flex-1 gap-2"
          >
            <div className="relative min-w-0 flex-1">

              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#718096]"
              />

              <input
                type="search"
                name="search"
                placeholder="Search products, brands..."
                className="h-12 w-full rounded-xl border border-[#D8E0EA] bg-white pl-11 pr-4 text-sm text-[#334155] outline-none transition placeholder:text-[#94A3B8] focus:border-[#C6922F] focus:ring-2 focus:ring-[#C6922F]/10"
              />

            </div>

            <button
              type="submit"
              className="h-12 shrink-0 rounded-xl bg-[#0F2B5B] px-5 text-sm font-semibold text-white transition hover:bg-[#17396F]"
            >
              Search
            </button>
          </form>

          {/* FILTER */}

          <button
            type="button"
            onClick={handleFilter}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#D8E0EA] bg-white px-5 text-sm font-semibold text-[#334155] transition hover:border-[#C6922F] hover:bg-[#FFF9ED] hover:text-[#C6922F]"
          >
            <SlidersHorizontal size={18} />

            <span>Filters</span>
          </button>

        </div>

      </div>
    </section>
  );
}