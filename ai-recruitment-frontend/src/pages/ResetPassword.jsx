import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Token automatically comes from the email reset link
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError(
        "Invalid password reset link. Please request a new password reset link."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/auth/reset-password",
        {
          token: token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );

      setMessage(
        response.data?.message ||
          "Password reset successfully."
      );

      setNewPassword("");
      setConfirmPassword("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error("Reset password error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h1
          style={{
            marginBottom: "10px",
            textAlign: "center",
            fontSize: "28px",
          }}
        >
          Reset Password
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Enter your new password below.
        </p>

        {message && (
          <div
            style={{
              background: "#e8f7ee",
              color: "#187a42",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#fdecec",
              color: "#c62828",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword}>

          {/* New Password */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={8}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Confirm Password */}

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              required
              minLength={8}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Reset Button */}

          <button
            type="submit"
            disabled={loading || !token}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background:
                loading || !token
                  ? "#9ca3af"
                  : "#2563eb",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              cursor:
                loading || !token
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Back to Login */}

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "12px",
            border: "none",
            background: "transparent",
            color: "#2563eb",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;