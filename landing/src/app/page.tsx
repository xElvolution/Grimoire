import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LoopSection from "@/components/LoopSection";
import Architecture from "@/components/Architecture";
import Economy from "@/components/Economy";
import ZeroGSection from "@/components/ZeroGSection";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <LoopSection />
      <Architecture />
      <Economy />
      <ZeroGSection />
      <CTA />
      <Footer />
    </main>
  );
}
