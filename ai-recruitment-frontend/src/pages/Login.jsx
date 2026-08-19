import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import logo from "../assets/vays-logo.png";

function Login() {
  const navigate = useNavigate();

  // =========================
  // Form State
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // UI State
  // =========================

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // Login Handler
  // =========================

  const handleLogin = async (event) => {
    event.preventDefault();

    // Clear previous error
    setError("");

    // Basic validation
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // Send login request to FastAPI
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/login",
        {
          email: email.trim(),
          password: password,
        }
      );

      // Get authentication data from backend
      const {
        access_token,
        token_type,
        recruiter,
      } = response.data;

      // Prepare authentication data
      const authData = {
        access_token,
        token_type,
        recruiter,
      };

      // =========================
      // Store Authentication
      // =========================

      if (rememberMe) {
        localStorage.setItem(
          "auth",
          JSON.stringify(authData)
        );

        // Remove session storage if it exists
        sessionStorage.removeItem("auth");
      } else {
        sessionStorage.setItem(
          "auth",
          JSON.stringify(authData)
        );

        // Remove local storage if it exists
        localStorage.removeItem("auth");
      }

      // =========================
      // Redirect to Dashboard
      // =========================

      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      // Handle different backend responses
      if (error.response) {
        if (error.response.status === 401) {
          setError("Invalid email or password.");
        } else if (error.response.status === 403) {
          setError("Your recruiter account is inactive.");
        } else {
          setError(
            "Unable to login right now. Please try again."
          );
        }
      } else {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">

      {/* ================= LEFT BRANDING SECTION ================= */}

      <div
        className="
          w-full lg:w-1/2
          min-h-[430px] lg:min-h-screen
          bg-gradient-to-br from-[#08B6D9] via-[#08B6D9] to-[#078EAE]
          flex flex-col items-center justify-center
          px-6 sm:px-10 lg:px-12
          py-12 lg:py-0
          relative
          overflow-hidden
        "
      >

        {/* Decorative Background Circles */}

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

        {/* Branding Content */}

        <div className="relative z-10 flex flex-col items-center">

          {/* VAYS Logo */}

          <div
            className="
              bg-white
              rounded-2xl
              px-7 sm:px-9
              py-5 sm:py-6
              shadow-xl
              mb-7 sm:mb-8
              transition
              duration-300
              hover:scale-[1.02]
              hover:shadow-2xl
            "
          >
            <img
              src={logo}
              alt="VAYS Infotech"
              className="w-60 sm:w-72 lg:w-80"
            />
          </div>

          {/* Branding Text */}

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
            A smarter way to manage recruitment.
          </p>

          {/* Security Indicator */}

          <div
            className="
              flex
              items-center
              gap-2
              mt-7
              text-white/80
              text-sm
            "
          >
            <ShieldCheck size={17} />
            Secure recruiter access
          </div>

        </div>

      </div>


      {/* ================= RIGHT LOGIN SECTION ================= */}

      <div
        className="
          w-full lg:w-1/2
          min-h-[580px] lg:min-h-screen
          flex items-center justify-center
          px-6 sm:px-10 lg:px-12
          py-12 lg:py-0
          bg-white
        "
      >

        <div className="w-full max-w-md">

          {/* Heading */}

          <div className="mb-8">

            <h2
              className="
                text-3xl sm:text-4xl
                font-bold
                text-gray-900
                tracking-tight
              "
            >
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-2">
              Login to your recruiter account
            </p>

          </div>


          {/* ================= LOGIN FORM ================= */}

          <form
            className="space-y-5"
            onSubmit={handleLogin}
          >

            {/* ================= EMAIL ================= */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  }}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={loading}
                  className="
                    w-full
                    pl-11 pr-4
                    py-3.5
                    border border-gray-300
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


            {/* ================= PASSWORD ================= */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="
                    w-full
                    pl-11 pr-12
                    py-3.5
                    border border-gray-300
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

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-[#08B6D9]
                    transition-colors
                    duration-200
                    disabled:cursor-not-allowed
                  "
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>


            {/* ================= ERROR MESSAGE ================= */}

            {error && (
              <div
                className="
                  rounded-xl
                  border border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                "
              >
                {error}
              </div>
            )}


            {/* ================= REMEMBER ME + FORGOT ================= */}

            <div
              className="
                flex
                flex-col sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
                pt-1
              "
            >

              <label
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-gray-600
                  cursor-pointer
                "
              >

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  disabled={loading}
                  className="
                    w-4
                    h-4
                    accent-[#08B6D9]
                    cursor-pointer
                  "
                />

                Remember me

              </label>


              <button
                type="button"
                disabled={loading}
                className="
                  text-sm
                  text-[#08B6D9]
                  font-semibold
                  hover:text-[#078EAE]
                  hover:underline
                  transition
                  text-left sm:text-right
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Forgot password?
              </button>

            </div>


            {/* ================= LOGIN BUTTON ================= */}

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
                disabled:hover:shadow-md
              "
            >
              {loading ? "Signing in..." : "Login"}
            </button>

          </form>


          {/* ================= BOTTOM SECURITY MESSAGE ================= */}

          <p
            className="
              text-center
              text-xs
              text-gray-400
              mt-7
            "
          >
            Authorized recruiter access only
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;