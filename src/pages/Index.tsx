
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Globe, MessageSquare, Code, Database, Zap } from "lucide-react";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate elements on page load
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.remove('opacity-0');
          }
        });
      },
      { threshold: 0.1 }
    );

    const heroElements = heroRef.current?.querySelectorAll('.animate-on-scroll');
    const featureElements = featuresRef.current?.querySelectorAll('.feature-card');
    
    heroElements?.forEach((el) => observer.observe(el));
    featureElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="min-h-screen flex flex-col items-center justify-center pt-16 pb-24 px-4"
      >
        <div className="w-full max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block mb-2 animate-on-scroll opacity-0">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              All-in-One AI Platform
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-on-scroll opacity-0">
            Transform Web Data Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
              Intelligent Solutions
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-on-scroll opacity-0">
            Combine powerful web scraping with custom chatbot development.
            Extract data and build AI solutions in minutes, not months.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-6 animate-on-scroll opacity-0">
            <Link to="/web-scraper">
              <Button size="lg" className="group">
                Try Web Scraper
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/chatbot-builder">
              <Button size="lg" variant="outline" className="group">
                Build Chatbot
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="pt-12 animate-on-scroll opacity-0">
            <div className="p-[1px] rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-background">
              <div className="glass-card rounded-2xl overflow-hidden">
                <img 
                  src="https://placehold.co/1200x600/f0f8ff/e6f0ff?text=AI+Platform+Interface" 
                  alt="Platform interface preview" 
                  className="w-full h-auto shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful AI Modules</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides two complementary tools to help you harness the power of AI
              for your business needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard 
              icon={<Globe className="w-10 h-10 text-primary" />}
              title="Dynamic Web Scraping"
              description="Automatically detect and extract data from any website with our intelligent scraper. Powered by open-source LLMs with Gemini Flash 2.0 backup."
              features={[
                "Input any URL and analyze website structure",
                "Select specific data elements to extract",
                "Download results in JSON or CSV format",
                "Track scraping history and manage sessions"
              ]}
              ctaLink="/web-scraper"
              ctaText="Start Scraping"
            />
            
            <FeatureCard 
              icon={<MessageSquare className="w-10 h-10 text-primary" />}
              title="One-Click Chatbot Builder"
              description="Create custom chatbots trained on your business data in minutes. Upload your documents and let our AI handle the rest."
              features={[
                "Upload CSV and PDF documents",
                "Automatic fine-tuning of open-source LLM",
                "Immediate testing and feedback",
                "Deploy ready-to-use on your website"
              ]}
              ctaLink="/chatbot-builder"
              ctaText="Build Chatbot"
            />
          </div>
          
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              Built with powerful technology and designed with simplicity in mind.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <AdvantageCard 
                icon={<Code />}
                title="Open Source LLMs"
                description="Utilizes lightweight, powerful open-source models optimized for specific tasks."
              />
              <AdvantageCard 
                icon={<Database />}
                title="Secure Data Handling"
                description="Your data remains private and secure throughout the process with Supabase integration."
              />
              <AdvantageCard 
                icon={<Zap />}
                title="Intelligent Fallbacks"
                description="Gemini Flash 2.0 backup ensures reliability and consistent quality."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  features, 
  ctaLink, 
  ctaText 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  features: string[]; 
  ctaLink: string; 
  ctaText: string; 
}) => {
  return (
    <Card className="feature-card opacity-0 overflow-hidden transition duration-300 hover:shadow-md border border-border/50">
      <div className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="mr-2 mt-1 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              </div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Link to={ctaLink}>
          <Button className="w-full group">
            {ctaText}
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};

const AdvantageCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => {
  return (
    <div className="feature-card opacity-0 p-6 rounded-lg bg-card shadow-sm border border-border/50 transition duration-300 hover:shadow-md">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default Index;
