import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <div className="min-h-screen pt-16">
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-lg">
          <h1 className="text-4xl md:text-5xl font-display font-bold gold-gradient-text mb-4 text-center">
            Contact Us
          </h1>
          <p className="font-body text-muted-foreground text-center mb-12">
            Have questions, feedback, or want to collaborate? Drop us a message.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-6"
          >
            <div>
              <label className="font-body text-sm font-semibold text-foreground block mb-2">Name</label>
              <input
                type="text"
                className="w-full bg-secondary border border-border rounded-md px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="font-body text-sm font-semibold text-foreground block mb-2">Email</label>
              <input
                type="email"
                className="w-full bg-secondary border border-border rounded-md px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="font-body text-sm font-semibold text-foreground block mb-2">Message</label>
              <textarea
                rows={5}
                className="w-full bg-secondary border border-border rounded-md px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="What's on your mind?"
              />
            </div>
            <Button variant="hero" size="lg" className="w-full text-lg py-6">
              Send Message
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;
