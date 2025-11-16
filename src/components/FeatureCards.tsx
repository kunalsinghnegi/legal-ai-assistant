import { MessageSquare, FileSearch, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "Ask Legal AI Assistant",
    description: "Get instant answers to your legal questions powered by advanced AI technology",
  },
  {
    icon: FileSearch,
    title: "Search Similar Past Cases",
    description: "Access a comprehensive database of past legal cases to inform your decisions",
  },
  {
    icon: UserCheck,
    title: "Hire Experienced Lawyers",
    description: "Connect with qualified legal professionals who can help with your case",
  },
];

const FeatureCards = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border"
              style={{ boxShadow: 'var(--card-shadow)' }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
