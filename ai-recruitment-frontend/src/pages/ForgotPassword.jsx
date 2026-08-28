import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle,
} from "lucide-react";

import logo from "../assets/vays-logo.png";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // Send Password Reset Request
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/auth/forgot-password",
        {
          email: email.trim(),
        }
      );

      setMessage(
        response.data?.message ||
          "If an account exists with this email, a password reset link has been sent."
      );

    } catch (error) {
      console.error("Forgot password error:", error);

      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError(
          "Unable to process your request right now. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">

      {/* =====================================================
          LEFT BRANDING SECTION
      ===================================================== */}

      <div
        className="
          w-full lg:w-1/2
          min-h-[380px] lg:min-h-screen
          bg-gradient-to-br
          from-[#08B6D9]
          via-[#08B6D9]
          to-[#078EAE]
          flex flex-col
          items-center
          justify-center
          px-6 sm:px-10 lg:px-12
          py-12 lg:py-0
          relative
          overflow-hidden
        "
      >

        {/* Decorative circles */}

        <div
          className="
            absolute
            -top-24
            -left-24
            w-64
            h-64
            rounded-full
            bg-white/5
          "
        />

        <div
          className="
            absolute
            -bottom-32
            -right-24
            w-80
            h-80
            rounded-full
            bg-white/5
          "
        />

        {/* Branding */}

        <div className="relative z-10 flex flex-col items-center">

          <div
            className="
              bg-white
              rounded-2xl
              px-7 sm:px-9
              py-5 sm:py-6
              shadow-xl
              mb-7 sm:mb-8
            "
          >
            <img
              src={logo}
              alt="VAYS Infotech"
              className="w-60 sm:w-72 lg:w-80"
            />
          </div>

          <h1
            className="
              text-3xl sm:text-4xl
              font-bold
              text-white
              text-center
              tracking-tight
            "
          >
            AI Recruitment Platform
          </h1>

          <p
            className="
              text-white/90
              text-center
              mt-3 sm:mt-4
              text-base sm:text-lg
              max-w-md
              leading-relaxed
            "
          >
            Securely recover your recruiter account.
          </p>

        </div>

      </div>


      {/* =====================================================
          RIGHT FORGOT PASSWORD SECTION
      ===================================================== */}

      <div
        className="
          w-full lg:w-1/2
          min-h-[580px] lg:min-h-screen
          flex items-center
          justify-center
          px-6 sm:px-10 lg:px-12
          py-12 lg:py-0
          bg-white
        "
      >

        <div className="w-full max-w-md">

          {/* Back to Login */}

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="
              flex
              items-center
              gap-2
              text-sm
              text-gray-500
              hover:text-[#08B6D9]
              transition
              mb-8
            "
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>


          {/* Heading */}

          <div className="mb-8">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-[#08B6D9]/10
                flex
                items-center
                justify-center
                mb-5
              "
            >
              <KeyRound
                size={24}
                className="text-[#08B6D9]"
              />
            </div>

            <h2
              className="
                text-3xl sm:text-4xl
                font-bold
                text-gray-900
                tracking-tight
              "
            >
              Forgot Password?
            </h2>

            <p
              className="
                text-gray-500
                mt-3
                leading-relaxed
              "
            >
              Enter your registered recruiter email address
              and we'll help you reset your password.
            </p>

          </div>


          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (
            <div
              className="
                flex
                gap-3
                rounded-xl
                border
                border-green-200
                bg-green-50
                px-4
                py-4
                mb-5
                text-sm
                text-green-700
              "
            >
              <CheckCircle
                size={20}
                className="flex-shrink-0 mt-0.5"
              />

              <p>
                {message}
              </p>

            </div>
          )}


          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div
              className="
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                mb-5
                text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}


          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}

            <div>

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                "
              >
                Email
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    pointer-events-none
                  "
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setMessage("");
                  }}
                  placeholder="Enter your registered email"
                  autoComplete="email"
                  disabled={loading}
                  className="
                    w-full
                    pl-11
                    pr-4
                    py-3.5
                    border
                    border-gray-300
                    rounded-xl
                    outline-none
                    bg-white
                    text-gray-900
                    placeholder:text-gray-400
                    transition-all
                    duration-200
                    hover:border-gray-400
                    focus:ring-2
                    focus:ring-[#08B6D9]/20
                    focus:border-[#08B6D9]
                    disabled:bg-gray-50
                    disabled:cursor-not-allowed
                  "
                />

              </div>

            </div>


            {/* Submit Button */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-gradient-to-r
                from-[#08B6D9]
                to-[#079FBE]
                text-white
                py-3.5
                rounded-xl
                font-semibold
                shadow-md
                hover:shadow-lg
                hover:from-[#079FBE]
                hover:to-[#078EAE]
                active:scale-[0.99]
                transition-all
                duration-200
                disabled:opacity-70
                disabled:cursor-not-allowed
              "
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>

          </form>


          {/* Login Link */}

          <div className="text-center mt-7">

            <span className="text-sm text-gray-500">
              Remember your password?{" "}
            </span>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                text-sm
                text-[#08B6D9]
                font-semibold
                hover:text-[#078EAE]
                hover:underline
              "
            >
              Login
            </button>

          </div>


          {/* Security Message */}

          <p
            className="
              text-center
              text-xs
              text-gray-400
              mt-8
            "
          >
            Authorized recruiter access only
          </p>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;