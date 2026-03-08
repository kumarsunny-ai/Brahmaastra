import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-lg">
        <SectionHeading title="Get in Touch" subtitle="Questions, feedback, or partnership ideas? We'd love to hear from you." />

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4 mb-8">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-foreground block mb-1">Name</label>
            <input
              id="name"
              type="text"
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground block mb-1">Email</label>
            <input
              id="email"
              type="email"
              maxLength={255}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-medium text-foreground block mb-1">Message</label>
            <textarea
              id="message"
              maxLength={1000}
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="What's on your mind?"
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-lg gradient-bg text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Send Message
          </button>
        </form>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
            <Mail size={16} />
            <span>hello@brahmaastra.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
