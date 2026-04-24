import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/legal-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(28, 42, 64, 0.85), rgba(28, 42, 64, 0.85)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10 text-center pt-24">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          AI Powered Legal Assistant
          <br />
          <span className="text-accent">& Case Recommendation System</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
          Get instant legal guidance, search similar cases, and connect with experienced lawyers
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth?role=client">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-full transition-all hover:scale-105"
            >
              Get Legal Help
            </Button>
          </Link>
          <Link to="/auth?role=lawyer">
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-lg px-8 py-6 rounded-full backdrop-blur-sm transition-all hover:scale-105"
            >
              I'm a Lawyer
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
