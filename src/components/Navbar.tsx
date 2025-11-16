import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold text-foreground">LegalAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Find Lawyer
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hover:bg-secondary">
              Login
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Signup
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
