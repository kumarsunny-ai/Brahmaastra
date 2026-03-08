import { useState } from "react";
import { z } from "zod";
import SectionHeading from "@/components/SectionHeading";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send } from "lucide-react";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email").max(255, "Email must be under 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be under 1000 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;
type FormErrors = Partial<Record<keyof ContactForm, string>>;

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ContactForm;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    // Simulate send
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", message: "" });
      setSubmitting(false);
    }, 800);
  };

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-lg">
        <SectionHeading title="Get in Touch" subtitle="Questions, feedback, or partnership ideas? We'd love to hear from you." />

        <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-xl p-6 space-y-5 mb-8" noValidate>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-foreground block mb-1.5">Name</label>
            <input
              id="name"
              type="text"
              maxLength={100}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={`w-full bg-secondary border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.name ? "border-destructive" : "border-border"}`}
              placeholder="Your name"
            />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground block mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              maxLength={255}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={`w-full bg-secondary border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.email ? "border-destructive" : "border-border"}`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="message" className="text-sm font-medium text-foreground block mb-1.5">Message</label>
            <textarea
              id="message"
              maxLength={1000}
              rows={5}
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              className={`w-full bg-secondary border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors ${errors.message ? "border-destructive" : "border-border"}`}
              placeholder="What's on your mind?"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.message ? <p className="text-destructive text-xs">{errors.message}</p> : <span />}
              <span className="text-muted-foreground text-xs">{form.message.length}/1000</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg gradient-bg text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Send size={16} />
            {submitting ? "Sending…" : "Send Message"}
          </button>
        </form>

        <div className="text-center">
          <a href="mailto:hello@brahmaastra.com" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
            <Mail size={16} />
            hello@brahmaastra.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
