import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import AdminNavbar from "./AdminNavbar";

import { supabase } from "../../lib/supabase";


export default function AdminLayout() {

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);


  /*
   * ==========================================
   * CHECK ADMIN AUTHENTICATION
   * ==========================================
   */

  useEffect(() => {

    async function checkAdminAccess() {

      try {

        /*
         * GET CURRENT SUPABASE USER
         */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();


        if (userError || !user) {

          setIsAdmin(false);
          setLoading(false);

          return;
        }


        /*
         * CHECK WHETHER USER EXISTS
         * IN admin_users TABLE
         */

        const {
          data: adminUser,
          error: adminError,
        } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();


        if (adminError) {

          console.error(
            "Admin access verification error:",
            adminError
          );

          setIsAdmin(false);
          setLoading(false);

          return;
        }


        /*
         * USER IS ADMIN
         */

        if (adminUser) {

          setIsAdmin(true);

        } else {

          setIsAdmin(false);

        }

      } catch (error) {

        console.error(
          "Unexpected admin access error:",
          error
        );

        setIsAdmin(false);

      } finally {

        setLoading(false);

      }

    }


    checkAdminAccess();

  }, []);


  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[#FBF9F6]">

        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#DDE3EA] border-t-[#0F2B5B]" />

          <p className="mt-4 text-sm text-[#718096]">
            Checking admin access...
          </p>

        </div>

      </div>

    );

  }


  /*
   * ==========================================
   * NOT ADMIN
   * ==========================================
   */

  if (!isAdmin) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );

  }


  /*
   * ==========================================
   * ADMIN AREA
   * ==========================================
   */

  return (

    <div className="min-h-screen bg-[#FBF9F6]">

      <AdminNavbar />

      <Outlet />

    </div>

  );

}