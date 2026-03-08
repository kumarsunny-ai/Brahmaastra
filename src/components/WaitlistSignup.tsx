import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface WaitlistFormData {
  name: string;
  email: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

interface WaitlistSignupProps {
  onSubmit?: (data: WaitlistFormData) => Promise<void>;
}

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const WaitlistSignup = ({ onSubmit }: WaitlistSignupProps) => {
  const [form, setForm] = useState<WaitlistFormData>({ name: "", email: "" });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Partial<WaitlistFormData>>({});
  const [errorMessage, setErrorMessage] = useState("");

  const validate = useCallback((): boolean => {
    const newErrors: Partial<WaitlistFormData> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (form.name.trim().length < 2) newErrors.name = "Name is too short";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(form.email.trim())) newErrors.email = "Enter a valid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      if (onSubmit) {
        await onSubmit({ name: form.name.trim(), email: form.email.trim() });
      } else {
        // Simulate API call — replace with real backend later
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setStatus("success");
      setForm({ name: "", email: "" });
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleChange = (field: keyof WaitlistFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status === "error") setStatus("idle");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-accent/30 rounded-2xl p-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/15 text-accent mb-4">
              <CheckCircle size={28} />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">You're on the list! 🎮</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We'll send you updates on Gilli Panda, new games, and early access drops.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up another email
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border/50 rounded-2xl p-6 space-y-4"
            noValidate
          >
            <div>
              <label htmlFor="waitlist-name" className="text-sm font-medium text-foreground block mb-1.5">
                Name
              </label>
              <input
                id="waitlist-name"
                type="text"
                maxLength={100}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your name"
                aria-invalid={!!errors.name}
                className={`w-full bg-secondary/80 border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  errors.name ? "border-destructive" : "border-border/50"
                }`}
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="waitlist-email" className="text-sm font-medium text-foreground block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="waitlist-email"
                  type="email"
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  className={`w-full bg-secondary/80 border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                    errors.email ? "border-destructive" : "border-border/50"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {status === "error" && errorMessage && (
              <p className="text-destructive text-sm text-center bg-destructive/10 rounded-lg py-2 px-3">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 rounded-xl gradient-bg text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Joining...
                </>
              ) : (
                "Join the Waitlist"
              )}
            </button>

            <p className="text-muted-foreground text-xs text-center">
              No spam, ever. Just game updates and early access.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaitlistSignup;
