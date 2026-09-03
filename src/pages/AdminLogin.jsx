import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  LockKeyhole,
  Mail,
  ArrowLeft,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /*
   * ==========================================
   * ADMIN LOGIN
   * ==========================================
   */

  async function handleLogin(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setErrorMessage(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * LOGIN THROUGH SUPABASE AUTH
       */

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        console.error(
          "Admin login error:",
          error
        );

        setErrorMessage(
          error.message
        );

        return;
      }

      /*
       * MAKE SURE A USER WAS ACTUALLY LOGGED IN
       */

      if (!data?.user) {
        setErrorMessage(
          "Login failed. Please try again."
        );

        return;
      }

      /*
       * CHECK WHETHER THIS USER IS AN ADMIN
       */

      const {
        data: adminUser,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError) {
        console.error(
          "Admin verification error:",
          adminError
        );

        await supabase.auth.signOut();

        setErrorMessage(
          "Unable to verify admin access."
        );

        return;
      }

      /*
       * USER IS NOT AN ADMIN
       */

      if (!adminUser) {
        await supabase.auth.signOut();

        setErrorMessage(
          "You do not have permission to access the admin panel."
        );

        return;
      }

      /*
       * ADMIN LOGIN SUCCESS
       */

      console.log(
        "Admin login successful:",
        data.user.email
      );

      navigate("/admin");

    } catch (error) {
      console.error(
        "Unexpected admin login error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Something went wrong while logging in."
      );

    } finally {
      setLoading(false);
    }
  }


  /*
   * ==========================================
   * FORGOT PASSWORD
   * ==========================================
   */

  async function handleForgotPassword() {

    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage(
        "Please enter your admin email address first."
      );

      return;
    }

    try {

      setResetLoading(true);

      /*
       * SEND PASSWORD RESET EMAIL
       */

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo:
              `${window.location.origin}/admin/reset-password`,
          }
        );

      if (error) {

        console.error(
          "Password reset error:",
          error
        );

        setErrorMessage(
          error.message
        );

        return;
      }

      /*
       * RESET EMAIL SENT
       */

      setSuccessMessage(
        "Password reset email sent. Please check your email and follow the link to create a new password."
      );

    } catch (error) {

      console.error(
        "Unexpected password reset error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to send password reset email."
      );

    } finally {

      setResetLoading(false);

    }
  }


  return (
    <section className="min-h-screen bg-[#FBF9F6] px-6 py-16">

      <div className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center">

        <div className="w-full rounded-3xl border border-[#E3E9F1] bg-white p-7 shadow-[0_10px_40px_rgba(15,43,91,0.08)] sm:p-9">

          {/* LOGO / TITLE */}

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B5B] text-white">

              <LockKeyhole size={28} />

            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#0F2B5B]">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-[#718096]">
              Param Computers Management Panel
            </p>

          </div>


          {/* ERROR */}

          {errorMessage && (

            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">

              {errorMessage}

            </div>

          )}


          {/* SUCCESS */}

          {successMessage && (

            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">

              {successMessage}

            </div>

          )}


          {/* FORM */}

          <form
            onSubmit={handleLogin}
            className="mt-7 space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="text-sm font-semibold text-[#334155]">
                Email
              </label>

              <div className="relative mt-2">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  placeholder="Enter admin email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-[#DDE3EA] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <div className="flex items-center justify-between">

                <label className="text-sm font-semibold text-[#334155]">
                  Password
                </label>

              </div>

              <div className="relative mt-2">

                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-[#DDE3EA] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                />

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={
                loading ||
                resetLoading
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#17396F] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Signing In...

                </>
              ) : (
                "Sign In"
              )}

            </button>


            {/* FORGOT PASSWORD */}

            <div className="text-center">

              <button
                type="button"
                onClick={
                  handleForgotPassword
                }
                disabled={
                  loading ||
                  resetLoading
                }
                className="text-sm font-semibold text-[#0F2B5B] transition hover:text-[#C6922F] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {resetLoading ? (
                  <span className="inline-flex items-center gap-2">

                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    Sending reset email...

                  </span>
                ) : (
                  "Forgot password?"
                )}

              </button>

            </div>

          </form>


          {/* FOOTER */}

          <p className="mt-6 text-center text-xs leading-5 text-[#94A3B8]">

            Authorized business management access only.

          </p>

        </div>

      </div>

    </section>
  );
}