interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  gradient?: boolean;
}

const SectionHeading = ({ title, subtitle, gradient = true }: SectionHeadingProps) => (
  <div className="text-center mb-12">
    <h2 className={`text-3xl md:text-4xl font-display font-bold mb-3 ${gradient ? "gradient-text" : "text-foreground"}`}>
      {title}
    </h2>
    {subtitle && <p className="text-muted-foreground max-w-lg mx-auto">{subtitle}</p>}
  </div>
);

export default SectionHeading;
