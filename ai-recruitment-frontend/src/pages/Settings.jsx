import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  getLLMConfigs,
  activateLLMConfig,
  createLLMConfig,
} from "../services/api";

function Settings() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    provider: "",
    model: "",
    api_key: "",
    base_url: "",
    temperature: 0.2,
    max_tokens: 2048,
  });

  // =========================================================
  // LOAD LLM CONFIGURATIONS
  // =========================================================

  const loadConfigs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLLMConfigs();
      setConfigs(response.data);
    } catch (err) {
      console.error("Failed to load LLM configurations:", err);
      setError("Unable to load LLM configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  // =========================================================
  // FORM INPUT HANDLER
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE LLM CONFIGURATION
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.provider.trim()) {
      setError("Provider is required.");
      return;
    }

    if (!form.model.trim()) {
      setError("Model is required.");
      return;
    }

    try {
      setSaving(true);

      await createLLMConfig({
        provider: form.provider.trim(),
        model: form.model.trim(),
        api_key: form.api_key.trim() || null,
        base_url: form.base_url.trim() || null,
        temperature: Number(form.temperature),
        max_tokens: Number(form.max_tokens),
      });

      setSuccess("LLM configuration added successfully.");

      // Clear form
      setForm({
        provider: "",
        model: "",
        api_key: "",
        base_url: "",
        temperature: 0.2,
        max_tokens: 2048,
      });

      // Reload configurations
      await loadConfigs();
    } catch (err) {
      console.error("Failed to create LLM configuration:", err);

      const detail = err.response?.data?.detail;

      setError(
        detail || "Unable to create LLM configuration."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ACTIVATE LLM CONFIGURATION
  // =========================================================

  const handleActivate = async (id) => {
    try {
      setActivating(id);
      setError("");
      setSuccess("");

      await activateLLMConfig(id);

      setSuccess("LLM configuration activated successfully.");

      await loadConfigs();
    } catch (err) {
      console.error("Failed to activate LLM:", err);

      const detail = err.response?.data?.detail;

      setError(
        detail || "Unable to activate this LLM configuration."
      );
    } finally {
      setActivating(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Settings
          </h1>

          <p className="text-gray-500 mt-1">
            Configure the AI models used by the recruitment platform.
          </p>
        </div>


        {/* =====================================================
            ADD NEW LLM CONFIGURATION
        ====================================================== */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Add LLM Configuration
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Add an AI provider and configure the model used by the
              recruitment assistant.
            </p>
          </div>


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Provider + Model */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>

                <input
                  type="text"
                  name="provider"
                  value={form.provider}
                  onChange={handleChange}
                  placeholder="e.g. gemini, openai, ollama"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>

                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="e.g. gemini-2.5-flash"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

            </div>


            {/* API Key */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>

              <input
                type="password"
                name="api_key"
                value={form.api_key}
                onChange={handleChange}
                placeholder="Enter API key"
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <p className="text-xs text-gray-500 mt-1">
                The API key will be encrypted before being stored.
              </p>
            </div>


            {/* Base URL */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL
                <span className="text-gray-400 font-normal">
                  {" "} (optional)
                </span>
              </label>

              <input
                type="text"
                name="base_url"
                value={form.base_url}
                onChange={handleChange}
                placeholder="e.g. http://localhost:11434"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>


            {/* Temperature + Max Tokens */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature
                </label>

                <input
                  type="number"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  min="0"
                  max="2"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Range: 0 to 2
                </p>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>

                <input
                  type="number"
                  name="max_tokens"
                  value={form.max_tokens}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

            </div>


            {/* Save Button */}

            <div className="flex justify-end pt-2">

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving..."
                  : "Save Configuration"}
              </button>

            </div>

          </form>

        </div>


        {/* =====================================================
            STATUS MESSAGES
        ====================================================== */}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {success}
          </div>
        )}


        {/* =====================================================
            EXISTING LLM CONFIGURATIONS
        ====================================================== */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              LLM Configurations
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage and switch between available AI language models.
            </p>
          </div>


          {/* Loading */}

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading LLM configurations...
            </div>

          ) : configs.length === 0 ? (

            <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                No LLM configurations found.
              </p>
            </div>

          ) : (

            <div className="space-y-4">

              {configs.map((config) => (

                <div
                  key={config.id}
                  className={`border rounded-lg p-5 ${
                    config.is_active
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >

                  <div className="flex items-center justify-between gap-4">

                    {/* Configuration Details */}

                    <div>

                      <div className="flex items-center gap-3">

                        <h3 className="text-lg font-semibold text-gray-800">
                          {config.provider}
                        </h3>

                        {config.is_active && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            Active
                          </span>
                        )}

                      </div>


                      <p className="text-gray-600 mt-1">
                        Model:{" "}
                        <span className="font-medium">
                          {config.model}
                        </span>
                      </p>


                      <p className="text-sm text-gray-500 mt-1">
                        Temperature: {config.temperature}
                        {" · "}
                        Max tokens: {config.max_tokens}
                      </p>

                    </div>


                    {/* Activate */}

                    {!config.is_active && (

                      <button
                        onClick={() => handleActivate(config.id)}
                        disabled={activating === config.id}
                        className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {activating === config.id
                          ? "Activating..."
                          : "Activate"}
                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    </MainLayout>
  );
}

export default Settings;