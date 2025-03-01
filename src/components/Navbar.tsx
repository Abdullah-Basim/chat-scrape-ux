
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-2 bg-background/80 backdrop-blur-lg shadow-sm' : 'py-4 bg-transparent'
    }`}>
      <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center shadow-md">
            <span className="text-primary-foreground font-semibold text-sm">AI</span>
          </div>
          <span className="font-medium text-lg">AIoNE Platform</span>
        </Link>
        
        <div className="flex items-center space-x-1">
          <NavLink to="/" currentPath={location.pathname}>Home</NavLink>
          <NavLink to="/web-scraper" currentPath={location.pathname}>Web Scraper</NavLink>
          <NavLink to="/chatbot-builder" currentPath={location.pathname}>Chatbot Builder</NavLink>
          <Button variant="outline" size="sm" className="ml-2">
            Sign In
          </Button>
        </div>
      </div>
      <Separator className={`mt-2 opacity-0 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : ''}`} />
    </nav>
  );
};

const NavLink = ({ 
  to, 
  currentPath, 
  children 
}: { 
  to: string; 
  currentPath: string; 
  children: React.ReactNode 
}) => {
  const isActive = currentPath === to;
  
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'text-primary bg-primary/5' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
