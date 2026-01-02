"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap, 
  Lock,
  ChevronRight,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

// Static features data with images
const features = [
  {
    title: "Live Interactive Classes",
    desc: "Join expert-led sessions designed for deep understanding and engagement.",
    icon: Video,
    image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Recording Library",
    desc: "Access every past lesson anytime. Perfect for revision and reinforcement.",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Personalized Support",
    desc: "Our tutors are dedicated to your individual growth and exam success.",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600",
  }
];

const levels = ["KS3 Foundations", "GCSE Prep", "A-Level Mastery", "Exam Techniques"];

export default function HomePage() {
  const [imageScale, setImageScale] = useState(0.5); // Start at 50% size
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const lastTouchY = useRef<number>(0);

  useEffect(() => {
    setIsMounted(true);
    // Detect mobile/touch devices
    const checkMobile = () => {
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle wheel scroll to control image size (Desktop)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isMounted || isMobile) return;
    
    // If content is showing and we're scrolling in content area, let normal scroll happen
    if (showContent && contentRef.current) {
      const contentTop = contentRef.current.getBoundingClientRect().top;
      if (contentTop <= 0) {
        return; // Allow normal scrolling in content
      }
    }

    e.preventDefault();
    
    const delta = e.deltaY;
    const sensitivity = 0.0008; // Very slow, smooth scaling
    
    setImageScale(prev => {
      let newScale = prev + (delta * sensitivity);
      
      // Clamp between 0.4 (40%) and 1.0 (100%)
      newScale = Math.max(0.4, Math.min(1.0, newScale));
      
      // Check if we've reached full screen
      if (newScale >= 0.98) {
        setIsFullScreen(true);
        if (delta > 0) {
          // Scrolling down past full screen - show content
          setShowContent(true);
        }
      } else {
        setIsFullScreen(false);
        setShowContent(false);
      }
      
      return newScale;
    });
  }, [isMounted, isMobile, showContent]);

  // Handle touch events for mobile scroll-to-grow effect
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMounted || !isMobile) return;
    touchStartY.current = e.touches[0].clientY;
    lastTouchY.current = e.touches[0].clientY;
  }, [isMounted, isMobile]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isMounted || !isMobile) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = lastTouchY.current - currentY; // Positive = scrolling down
    lastTouchY.current = currentY;

    // If content is visible and scrolled past top, allow normal scrolling
    if (showContent && window.scrollY > 0) {
      return;
    }
    
    // If content is showing but at top and trying to scroll up, shrink image
    if (showContent && window.scrollY === 0 && deltaY < -10) {
      e.preventDefault();
      setShowContent(false);
      setIsFullScreen(false);
      setImageScale(0.95);
      return;
    }

    // If content is not showing, handle the zoom effect
    if (!showContent) {
      e.preventDefault();
      
      const sensitivity = 0.003; // Touch sensitivity
      
      setImageScale(prev => {
        let newScale = prev + (deltaY * sensitivity);
        
        // Clamp between 0.4 (40%) and 1.0 (100%)
        newScale = Math.max(0.4, Math.min(1.0, newScale));
        
        // Check if we've reached full screen
        if (newScale >= 0.98) {
          setIsFullScreen(true);
          if (deltaY > 5) {
            // Swiping up past full screen - show content
            setShowContent(true);
          }
        } else {
          setIsFullScreen(false);
        }
        
        return newScale;
      });
    }
  }, [isMounted, isMobile, showContent]);

  // Handle scroll when content is visible
  const handleContentScroll = useCallback(() => {
    if (!showContent || !contentRef.current) return;
    
    const scrollTop = window.scrollY;
    
    // If scrolled back to top and trying to scroll up more, shrink image
    if (scrollTop === 0 && !isMobile) {
      setShowContent(false);
    }
  }, [showContent, isMobile]);

  useEffect(() => {
    if (!isMounted) return;
    
    // Desktop: wheel events
    if (!isMobile) {
      window.addEventListener("wheel", handleWheel, { passive: false });
    }
    
    // Mobile: touch events
    if (isMobile) {
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
    }
    
    window.addEventListener("scroll", handleContentScroll);
    
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleContentScroll);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleContentScroll, isMounted, isMobile]);

  // Calculate visual properties
  const navOpacity = isFullScreen ? 1 : 0;
  const taglineOpacity = imageScale < 0.95 ? 1 : 0;
  const scrollHintOpacity = imageScale < 0.6 ? 1 : 0;

  return (
    <div className="relative bg-pastel-blue/40 overflow-x-hidden touch-pan-y">
      {/* Navigation - Only shows when image is full screen */}
      <nav 
        style={{ 
          opacity: navOpacity,
          pointerEvents: navOpacity > 0.5 ? "auto" : "none",
          transition: "opacity 0.3s ease-out"
        }}
        className="fixed top-0 left-0 right-0 z-50 bg-pastel-blue/95 backdrop-blur-xl border-b-2 border-pastel-blue-border/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pastel-blue-border/20 border-2 border-pastel-blue-border rounded-lg sm:rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-pastel-blue-border" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-pastel-blue-border tracking-tightest">BrainBooster</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-10">
              <Link href="#features" className="text-sm font-bold text-pastel-blue-border/70 hover:text-pastel-blue-border tracking-tightest transition-colors">Features</Link>
              <Link href="#subjects" className="text-sm font-bold text-pastel-blue-border/70 hover:text-pastel-blue-border tracking-tightest transition-colors">Subjects</Link>
              <Link href="/pricing" className="text-sm font-bold text-pastel-blue-border/70 hover:text-pastel-blue-border tracking-tightest transition-colors">Pricing</Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center gap-3 sm:gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-pastel-blue-border hover:bg-pastel-blue-border/10">Log In</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-pastel-blue-border hover:bg-pastel-blue-border/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-pastel-blue/98 backdrop-blur-xl border-t border-pastel-blue-border/20 absolute top-full left-0 right-0 p-4 space-y-3 shadow-xl">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-sm font-bold text-pastel-blue-border hover:bg-pastel-blue-border/10 rounded-xl transition-colors">Features</Link>
            <Link href="#subjects" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-sm font-bold text-pastel-blue-border hover:bg-pastel-blue-border/10 rounded-xl transition-colors">Subjects</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-sm font-bold text-pastel-blue-border hover:bg-pastel-blue-border/10 rounded-xl transition-colors">Pricing</Link>
            <div className="pt-3 border-t border-pastel-blue-border/20 flex flex-col gap-2">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Log In</Button>
              </Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Fixed with scroll-to-grow effect */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-10"
        style={{ 
          opacity: showContent ? 0 : 1,
          pointerEvents: showContent ? "none" : "auto",
          transition: "opacity 0.5s ease-out"
        }}
      >
        {/* Central Image that Grows with Scroll/Touch */}
        <div 
          style={{ 
            transform: `scale(${imageScale})`,
            transition: "transform 0.05s linear"
          }}
          className="relative w-[92vw] sm:w-[95vw] h-[75vh] sm:h-[85vh] max-w-[1400px] rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_16px_48px_-12px_rgba(123,163,224,0.5)] sm:shadow-[0_32px_64px_-16px_rgba(123,163,224,0.5)] border-2 sm:border-4 border-pastel-blue-border/40"
        >
          <Image 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2070" 
            alt="Students learning together"
            fill
            priority
            sizes="95vw"
            className="object-cover"
          />
          {/* STRONG blue overlay for text readability */}
          <div className="absolute inset-0 bg-[#3A6AB8]/70" />
          
          {/* Tagline - HIGH CONTRAST TEXT */}
          <div 
            style={{ 
              opacity: taglineOpacity,
              transition: "opacity 0.3s ease-out"
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-8"
          >
            <h1 className="text-3xl sm:text-5xl md:text-8xl font-bold tracking-tightest leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
              <span className="text-white">Master Your</span>
              <br />
              <span className="italic-accent text-pastel-cream">Future</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-xl md:text-2xl text-white font-bold tracking-tightest max-w-md sm:max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] px-2">
              Expert tutoring for Maths & English, designed for clarity and success.
            </p>
            <div className="mt-6 sm:mt-10">
              <Link href="/pricing">
                <Button size="lg" className="bg-white text-pastel-blue-border hover:bg-pastel-cream border-2 border-white font-bold shadow-xl text-sm sm:text-lg px-6 sm:px-8 h-12 sm:h-14">
                  Get Started <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll hint - shows when image is small */}
        <div 
          style={{ 
            opacity: scrollHintOpacity,
            transition: "opacity 0.3s ease-out"
          }}
          className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 text-pastel-blue-border flex flex-col items-center gap-2 sm:gap-3"
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            {isMobile ? "Swipe up to expand" : "Scroll to expand"}
          </span>
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
        </div>
      </div>

      {/* Spacer for when image is fixed */}
      <div style={{ height: showContent ? "0" : "100vh" }} />

      {/* Main Content - Slides up when image is full */}
      <div 
        ref={contentRef}
        style={{
          transform: showContent ? "translateY(0)" : "translateY(100vh)",
          opacity: showContent ? 1 : 0,
          transition: "transform 0.6s ease-out, opacity 0.4s ease-out"
        }}
        className="relative z-20 bg-pastel-blue/30"
      >

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-pastel-blue/40">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-16 md:mb-20">
              <Badge variant="primary" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm">The BrainBooster Method</Badge>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-pastel-blue-border mb-4 sm:mb-6 md:mb-8 tracking-tightest leading-tight">
                A <span className="italic-accent">Calm</span> Approach to Excellence
              </h2>
              <p className="text-sm sm:text-lg md:text-xl text-pastel-blue-border/70 max-w-3xl mx-auto tracking-tightest font-bold leading-relaxed px-2">
                We&apos;ve combined sophisticated technology with elite tutoring to create a learning environment that eliminates stress and maximizes results.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {features.map((item, i) => (
                <Card key={i} variant="bordered" className="overflow-hidden hover:border-pastel-blue-border transition-all duration-500 group relative">
                  {/* Card Image */}
                  <div className="relative h-36 sm:h-44 md:h-48 overflow-hidden">
                    <Image 
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pastel-blue/90 via-pastel-blue/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center border-2 border-pastel-blue-border/30 shadow-lg">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-pastel-blue-border" />
                    </div>
                  </div>
                  {/* Card Content */}
                  <div className="p-4 sm:p-6 md:p-8">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-pastel-blue-border mb-2 sm:mb-3 tracking-tightest">{item.title}</h3>
                    <p className="text-pastel-blue-border/70 leading-relaxed tracking-tightest font-medium text-xs sm:text-sm">{item.desc}</p>
                    <div className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm font-bold text-pastel-blue-border group-hover:gap-4 transition-all duration-300">
                      Learn more <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section id="subjects" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-pastel-cream relative">
          <div className="max-w-6xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div>
                <Badge variant="primary" className="mb-4 sm:mb-6 text-xs sm:text-sm">Specialized Subjects</Badge>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-pastel-blue-border mb-4 sm:mb-6 md:mb-8 tracking-tightest leading-tight">
                  Focused on what <span className="italic-accent">really</span> matters.
                </h2>
                <p className="text-sm sm:text-lg md:text-xl text-pastel-blue-border/70 mb-6 sm:mb-10 md:mb-12 tracking-tightest font-bold leading-relaxed">
                  We don&apos;t try to teach everything. We specialize in Maths and English because they are the foundation of every student&apos;s future success.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                  {levels.map((level) => (
                    <div key={level} className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-pastel-blue/40 rounded-xl sm:rounded-2xl border-2 border-pastel-blue-border/20 hover:border-pastel-blue-border/50 transition-colors">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-pastel-blue-border/20 border-2 border-pastel-blue-border/40 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-pastel-blue-border" />
                      </div>
                      <span className="font-bold text-pastel-blue-border tracking-tightest text-xs sm:text-sm">{level}</span>
                    </div>
                  ))}
                </div>
                <Link href="/pricing">
                  <Button size="lg" className="mt-6 sm:mt-8 md:mt-10 group h-12 sm:h-14 text-sm sm:text-base">
                    Explore our curriculum <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="relative order-first lg:order-last">
                <div className="absolute -inset-4 sm:-inset-6 md:-inset-8 bg-pastel-blue-border/20 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] blur-2xl sm:blur-3xl" />
                <div className="relative rounded-xl sm:rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-4 border-pastel-blue-border/30">
                  <Image 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
                    alt="Learning Environment"
                    width={1000}
                    height={700}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 p-3 sm:p-4 md:p-6 bg-pastel-blue/90 backdrop-blur-md rounded-xl sm:rounded-2xl border-2 border-pastel-blue-border/30">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pastel-blue-border/20 rounded-lg sm:rounded-xl flex items-center justify-center border-2 border-pastel-blue-border/40">
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-pastel-blue-border" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-pastel-blue-border">Expert Tutors Only</p>
                        <p className="text-[10px] sm:text-xs font-bold text-pastel-blue-border/70">Every session is led by a specialist</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-pastel-blue/50">
          <div className="max-w-5xl mx-auto">
            <Card className="p-6 sm:p-10 md:p-16 lg:p-20 relative overflow-hidden text-center border-2 sm:border-4 border-pastel-blue-border">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-pastel-blue-border/20 rounded-full blur-2xl sm:blur-3xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-pastel-blue/40 rounded-full blur-2xl sm:blur-3xl" />
              
              <div className="relative z-10">
                <Badge variant="primary" className="mb-4 sm:mb-6 md:mb-8 px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm">Join the community</Badge>
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-pastel-blue-border mb-4 sm:mb-6 md:mb-8 tracking-tightest leading-tight">
                  Ready to start your <span className="italic-accent">journey</span>?
                </h2>
                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-pastel-blue-border/70 mb-6 sm:mb-10 md:mb-12 tracking-tightest font-bold max-w-2xl mx-auto">
                  Unlock your full potential with a learning experience designed specifically for you.
                </p>
                <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 sm:flex-row justify-center">
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 md:h-16 px-6 sm:px-10 md:px-12 text-sm sm:text-base md:text-lg">View Plans & Subscribe</Button>
                  </Link>
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto h-12 sm:h-14 md:h-16 px-6 sm:px-10 md:px-12 text-sm sm:text-base md:text-lg">Talk to an Advisor</Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 border-t-2 border-pastel-blue-border/20 bg-pastel-blue/40">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12 md:mb-16">
              <div className="max-w-xs">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pastel-blue-border/20 border-2 border-pastel-blue-border rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-pastel-blue-border" />
                  </div>
                  <span className="font-bold text-lg sm:text-xl text-pastel-blue-border tracking-tightest">BrainBooster</span>
                </div>
                <p className="text-pastel-blue-border/70 font-bold tracking-tightest leading-relaxed text-sm sm:text-base">
                  Elite online tutoring for Maths & English. Redefining how students learn and excel.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12 w-full md:w-auto">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <span className="font-bold text-pastel-blue-border tracking-tightest text-xs sm:text-sm uppercase">Platform</span>
                  <Link href="/dashboard" className="text-xs sm:text-sm font-bold text-pastel-blue-border/60 hover:text-pastel-blue-border tracking-tightest transition-colors">Dashboard</Link>
                  <Link href="/dashboard/live-classes" className="text-xs sm:text-sm font-bold text-pastel-blue-border/60 hover:text-pastel-blue-border tracking-tightest transition-colors">Live Classes</Link>
                  <Link href="/dashboard/recordings" className="text-xs sm:text-sm font-bold text-pastel-blue-border/60 hover:text-pastel-blue-border tracking-tightest transition-colors">Recordings</Link>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <span className="font-bold text-pastel-blue-border tracking-tightest text-xs sm:text-sm uppercase">Subjects</span>
                  <Link href="#" className="text-xs sm:text-sm font-bold text-pastel-blue-border/60 hover:text-pastel-blue-border tracking-tightest transition-colors">Mathematics</Link>
                  <Link href="#" className="text-xs sm:text-sm font-bold text-pastel-blue-border/60 hover:text-pastel-blue-border tracking-tightest transition-colors">English</Link>
                  <Link href="#" className="text-xs sm:text-sm font-bold text-pastel-blue-border/60 hover:text-pastel-blue-border tracking-tightest transition-colors">Exam Prep</Link>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4 col-span-2 sm:col-span-1">
                  <span className="font-bold text-pastel-blue-border tracking-tightest text-xs sm:text-sm uppercase">Support</span>
                  <Link href="#" className="text-xs sm:text-sm font-bold text-pastel-blue-border/60 hover:text-pastel-blue-border tracking-tightest transition-colors">Contact Us</Link>
                  <Link href="#" className="text-xs sm:text-sm font-bold text-pastel-blue-border/60 hover:text-pastel-blue-border tracking-tightest transition-colors">FAQ</Link>
                  <Link href="#" className="text-xs sm:text-sm font-bold text-pastel-blue-border/60 hover:text-pastel-blue-border tracking-tightest transition-colors">Privacy Policy</Link>
                </div>
              </div>
            </div>
            <div className="pt-6 sm:pt-8 md:pt-10 border-t-2 border-pastel-blue-border/20 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
              <p className="text-pastel-blue-border/50 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-center sm:text-left">© 2025 BrainBooster Education. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
