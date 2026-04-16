import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { TrustBar } from '@/components/landing/TrustBar'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { LandingPageBuilderSection } from '@/components/landing/LandingPageBuilderSection'
import { PropertyShowcase } from '@/components/landing/PropertyShowcase'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Testimonials } from '@/components/landing/Testimonials'
import { PricingSection } from '@/components/landing/PricingSection'
import { CTABanner } from '@/components/landing/CTABanner'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <SmoothScroll>
      <div className="bg-[#0A0A0F]">
        <Navbar />
        <main>
          <HeroSection />
          <TrustBar />
          <FeaturesSection />
          <LandingPageBuilderSection />
          <PropertyShowcase />
          <HowItWorks />
          <Testimonials />
          <PricingSection />
          <CTABanner />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  )
}
