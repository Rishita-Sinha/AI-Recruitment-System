import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import logo from "../assets/vays-logo.png";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // Handle input changes
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear messages when user starts typing again
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // =========================
  // Handle registration
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Trim full name and email
    const fullName = formData.full_name.trim();
    const email = formData.email.trim();

    // =========================
    // Frontend validation
    // =========================

    if (fullName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    // =========================
    // Start loading
    // =========================

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            email: email,
            password: formData.password,
            confirm_password: formData.confirm_password,
          }),
        }
      );

      const data = await response.json();

      // =========================
      // Backend error
      // =========================

      if (!response.ok) {
        if (response.status === 409) {
          setError(
            "A recruiter with this email already exists. Please use a different email."
          );
        } else if (response.status === 400) {
          setError(
            data.detail || "The information provided is invalid."
          );
        } else if (response.status === 422) {
          setError(
            "Please check your information and make sure all fields are valid."
          );
        } else {
          setError(
            data.detail ||
              "Unable to create your account. Please try again."
          );
        }

        return;
      }

      // =========================
      // Registration successful
      // =========================

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      // Clear form
      setFormData({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
      });

      // =========================
      // Redirect to login page
      // =========================

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">

      {/* ===================================================== */}
      {/* LEFT BRANDING SECTION */}
      {/* ===================================================== */}

      <div
        className="
          w-full lg:w-1/2
          min-h-[430px] lg:min-h-screen
          bg-gradient-to-br
          from-[#2F8FD8]
          via-[#18B8C5]
          to-[#2BC6A5]
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
            bg-white/10
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
            bg-white/10
          "
        />

        <div
          className="
            absolute
            bottom-28
            right-[-40px]
            w-36
            h-36
            rounded-full
            bg-white/5
          "
        />

        {/* Branding content */}

        <div className="relative z-10 flex flex-col items-center">

          {/* Logo */}

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

          {/* Platform title */}

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

          {/* Subtitle */}

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

          {/* Security indicator */}

          <div
            className="
              flex
              items-center
              gap-2
              mt-7
              text-white/90
              text-sm
            "
          >
            <ShieldCheck size={17} />

            Built for smarter recruiter workflows
          </div>

        </div>
      </div>


      {/* ===================================================== */}
      {/* RIGHT SIGNUP SECTION */}
      {/* ===================================================== */}

      <div
        className="
          w-full lg:w-1/2
          min-h-[650px] lg:min-h-screen
          flex items-center
          justify-center
          px-6 sm:px-10 lg:px-12
          py-12 lg:py-10
          bg-slate-50
        "
      >

        <div className="w-full max-w-lg">

          {/* Registration heading */}

          <div className="mb-8">

            <div className="flex items-center gap-3 mb-4">

              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-[#18B8C5]/10
                  flex
                  items-center
                  justify-center
                  text-[#08AFC7]
                "
              >
                <UserPlus size={22} />
              </div>

              <span
                className="
                  text-[#08AFC7]
                  font-semibold
                  text-base
                "
              >
                Recruiter Registration
              </span>

            </div>

            <h2
              className="
                text-3xl sm:text-4xl
                font-bold
                text-gray-900
                tracking-tight
              "
            >
              Create your account
            </h2>

            <p className="text-gray-500 mt-2">
              Register to access the recruiter platform
            </p>

          </div>


          {/* ================================================= */}
          {/* ERROR MESSAGE */}
          {/* ================================================= */}

          {error && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-red-200
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


          {/* ================================================= */}
          {/* SUCCESS MESSAGE */}
          {/* ================================================= */}

          {success && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-green-200
                bg-green-50
                px-4
                py-3
                text-sm
                text-green-700
              "
            >
              {success}
            </div>
          )}


          {/* ================================================= */}
          {/* SIGNUP FORM */}
          {/* ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Full Name */}

            <div>

              <label
                htmlFor="full_name"
                className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                "
              >
                Full Name
              </label>

              <div className="relative">

                <User
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
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                  autoComplete="name"
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
                    focus:ring-[#18B8C5]/20
                    focus:border-[#18B8C5]
                    disabled:bg-gray-100
                    disabled:cursor-not-allowed
                  "
                />

              </div>
            </div>


            {/* Email */}

            <div>

              <label
                htmlFor="email"
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
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={loading}
                  autoComplete="email"
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
                    focus:ring-[#18B8C5]/20
                    focus:border-[#18B8C5]
                    disabled:bg-gray-100
                    disabled:cursor-not-allowed
                  "
                />

              </div>
            </div>


            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                "
              >
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
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  disabled={loading}
                  autoComplete="new-password"
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
                    focus:ring-[#18B8C5]/20
                    focus:border-[#18B8C5]
                    disabled:bg-gray-100
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
                    hover:text-[#08AFC7]
                    transition-colors
                    duration-200
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

              <p className="text-xs text-gray-400 mt-1.5">
                Password must be at least 8 characters.
              </p>

            </div>


            {/* Confirm Password */}

            <div>

              <label
                htmlFor="confirm_password"
                className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                "
              >
                Confirm Password
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
                  id="confirm_password"
                  name="confirm_password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                  autoComplete="new-password"
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
                    focus:ring-[#18B8C5]/20
                    focus:border-[#18B8C5]
                    disabled:bg-gray-100
                    disabled:cursor-not-allowed
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={loading}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-[#08AFC7]
                    transition-colors
                    duration-200
                  "
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>


            {/* ================================================= */}
            {/* CREATE ACCOUNT BUTTON */}
            {/* ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-gradient-to-r
                from-[#2F8FD8]
                to-[#22BFA9]
                text-white
                py-3.5
                rounded-xl
                font-semibold
                shadow-md
                hover:shadow-lg
                hover:from-[#2784C8]
                hover:to-[#1EAF9C]
                active:scale-[0.99]
                transition-all
                duration-200
                disabled:opacity-60
                disabled:cursor-not-allowed
                disabled:hover:shadow-md
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">

                  <span
                    className="
                      w-5
                      h-5
                      border-2
                      border-white/40
                      border-t-white
                      rounded-full
                      animate-spin
                    "
                  />

                  Creating Account...

                </span>
              ) : (
                "Create Account"
              )}
            </button>

          </form>


          {/* ================================================= */}
          {/* LOGIN LINK */}
          {/* ================================================= */}

          <p
            className="
              text-center
              text-sm
              text-gray-500
              mt-7
            "
          >
            Already have an account?{" "}

            <button
              type="button"
              onClick={() => {
                navigate("/login");
              }}
              className="
                text-[#08AFC7]
                font-semibold
                hover:text-[#078EAE]
                hover:underline
                transition
              "
            >
              Login
            </button>

          </p>


          {/* Security message */}

          <p
            className="
              text-center
              text-xs
              text-gray-400
              mt-6
            "
          >
            Your recruiter account is securely protected.
          </p>

        </div>
      </div>

    </div>
  );
}

export default Signup;