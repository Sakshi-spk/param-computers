import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  BarChart3,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabase";


export default function AdminNavbar() {

  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] =
    useState(false);


  async function handleLogout() {

    await supabase.auth.signOut();

    navigate("/admin/login");
  }


  const navItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: BarChart3,
    },

    {
      label: "Products",
      path: "/admin/products",
      icon: Package,
    },

    {
      label: "Orders",
      path: "/admin/orders",
      icon: ShoppingCart,
    },
  ];


  function closeMobileMenu() {
    setMobileOpen(false);
  }


  return (
    <header className="sticky top-0 z-40 border-b border-[#E3E9F1] bg-white">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* BRAND */}

        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="flex items-center gap-3"
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2B5B]">

            <span className="text-sm font-bold text-[#C6922F]">
              PC
            </span>

          </div>


          <div className="hidden text-left sm:block">

            <p className="text-sm font-bold leading-tight text-[#0F2B5B]">
              Param Computers
            </p>

            <p className="text-xs text-[#718096]">
              Admin Panel
            </p>

          </div>

        </button>


        {/* DESKTOP NAVIGATION */}

        <nav className="hidden items-center gap-1 md:flex">

          {navItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.label === "Dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#0F2B5B] text-white"
                      : "text-[#475569] hover:bg-[#F7F9FC] hover:text-[#0F2B5B]"
                  }`
                }
              >

                <Icon size={17} />

                {item.label}

              </NavLink>
            );

          })}

        </nav>


        {/* RIGHT SIDE */}

        <div className="hidden items-center gap-3 md:flex">

          <div className="flex items-center gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2B5B] text-xs font-bold text-white">
              A
            </div>

            <div className="hidden lg:block">

              <p className="text-xs font-semibold text-[#0F2B5B]">
                Administrator
              </p>

              <p className="text-[11px] text-[#718096]">
                Admin Account
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F2B5B] transition hover:bg-[#F7F9FC]"
          >

            <LogOut size={17} />

            Logout

          </button>

        </div>


        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              (current) => !current
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE3EA] text-[#0F2B5B] md:hidden"
          aria-label="Toggle admin menu"
        >

          {mobileOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}

        </button>

      </div>


      {/* MOBILE MENU */}

      {mobileOpen && (

        <div className="border-t border-[#E3E9F1] bg-white px-4 py-4 md:hidden">

          <nav className="space-y-1">

            {navItems.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.label === "Dashboard"}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                      isActive
                        ? "bg-[#0F2B5B] text-white"
                        : "text-[#475569] hover:bg-[#F7F9FC]"
                    }`
                  }
                >

                  <Icon size={18} />

                  {item.label}

                </NavLink>
              );

            })}

          </nav>


          <div className="my-4 border-t border-[#E3E9F1]" />


          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F2B5B] text-xs font-bold text-white">
              A
            </div>

            <div>

              <p className="text-sm font-semibold text-[#0F2B5B]">
                Administrator
              </p>

              <p className="text-xs text-[#718096]">
                Admin Account
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#DDE3EA] px-4 py-3 text-sm font-semibold text-[#0F2B5B] hover:bg-[#F7F9FC]"
          >

            <LogOut size={17} />

            Logout

          </button>

        </div>

      )}

    </header>
  );
}