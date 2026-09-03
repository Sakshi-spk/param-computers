import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Loader2,
  LockKeyhole,
} from "lucide-react";

import { supabase } from "../lib/supabase";


export default function AdminResetPassword() {

  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  /*
   * ==========================================
   * CHECK PASSWORD RECOVERY SESSION
   * ==========================================
   */

  useEffect(() => {

    let mounted = true;


    async function checkSession() {

      try {

        const {
          data: { session },
        } = await supabase.auth.getSession();


        if (!mounted) {
          return;
        }


        if (!session) {

          setErrorMessage(
            "This password reset link is invalid or has expired. Please request a new password reset email."
          );

        }

      } catch (error) {

        console.error(
          "Password recovery session error:",
          error
        );

        if (mounted) {

          setErrorMessage(
            "Unable to verify the password reset session."
          );

        }

      } finally {

        if (mounted) {

          setCheckingSession(false);

        }

      }

    }


    checkSession();


    /*
     * SUPABASE PASSWORD RECOVERY EVENT
     */

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (event) => {

          if (
            event ===
            "PASSWORD_RECOVERY"
          ) {

            setCheckingSession(false);

            setErrorMessage("");

          }

        }
      );


    return () => {

      mounted = false;

      authListener?.subscription?.unsubscribe();

    };

  }, []);


  /*
   * ==========================================
   * UPDATE PASSWORD
   * ==========================================
   */

  async function handleUpdatePassword(
    event
  ) {

    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");


    if (!password || !confirmPassword) {

      setErrorMessage(
        "Please enter and confirm your new password."
      );

      return;

    }


    if (password.length < 6) {

      setErrorMessage(
        "Password must be at least 6 characters long."
      );

      return;

    }


    if (password !== confirmPassword) {

      setErrorMessage(
        "Passwords do not match."
      );

      return;

    }


    try {

      setLoading(true);


      /*
       * UPDATE SUPABASE AUTH PASSWORD
       */

      const { error } =
        await supabase.auth.updateUser({
          password,
        });


      if (error) {

        console.error(
          "Password update error:",
          error
        );

        setErrorMessage(
          error.message
        );

        return;

      }


      /*
       * PASSWORD UPDATED
       */

      setSuccessMessage(
        "Your password has been updated successfully. Redirecting to admin login..."
      );


      setPassword("");
      setConfirmPassword("");


      /*
       * SIGN OUT AFTER PASSWORD CHANGE
       */

      await supabase.auth.signOut();


      setTimeout(() => {

        navigate(
          "/admin/login",
          { replace: true }
        );

      }, 2000);


    } catch (error) {

      console.error(
        "Unexpected password update error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to update your password."
      );

    } finally {

      setLoading(false);

    }

  }


  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (checkingSession) {

    return (

      <section className="flex min-h-screen items-center justify-center bg-[#FBF9F6] px-6">

        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#DDE3EA] border-t-[#0F2B5B]" />

          <p className="mt-4 text-sm text-[#718096]">

            Verifying password reset link...

          </p>

        </div>

      </section>

    );

  }


  return (

    <section className="min-h-screen bg-[#FBF9F6] px-6 py-16">

      <div className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center">

        <div className="w-full rounded-3xl border border-[#E3E9F1] bg-white p-7 shadow-[0_10px_40px_rgba(15,43,91,0.08)] sm:p-9">


          {/* TITLE */}

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B5B] text-white">

              <LockKeyhole size={28} />

            </div>


            <h1 className="mt-6 text-3xl font-bold text-[#0F2B5B]">

              Reset Password

            </h1>


            <p className="mt-2 text-sm text-[#718096]">

              Create a new password for your Param Computers admin account.

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

          {!successMessage && (

            <form
              onSubmit={
                handleUpdatePassword
              }
              className="mt-7 space-y-5"
            >

              {/* NEW PASSWORD */}

              <div>

                <label className="text-sm font-semibold text-[#334155]">

                  New Password

                </label>


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
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-[#DDE3EA] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                  />

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div>

                <label className="text-sm font-semibold text-[#334155]">

                  Confirm Password

                </label>


                <div className="relative mt-2">

                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />


                  <input
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-[#DDE3EA] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                  />

                </div>

              </div>


              {/* UPDATE BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#17396F] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (

                  <>

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Updating Password...

                  </>

                ) : (

                  "Update Password"

                )}

              </button>

            </form>

          )}


          {/* BACK TO LOGIN */}

          {!successMessage && (

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/login"
                )
              }
              className="mx-auto mt-6 flex items-center gap-2 text-sm font-semibold text-[#0F2B5B] transition hover:text-[#C6922F]"
            >

              <span>←</span>

              Back to Admin Login

            </button>

          )}

        </div>

      </div>

    </section>

  );

}