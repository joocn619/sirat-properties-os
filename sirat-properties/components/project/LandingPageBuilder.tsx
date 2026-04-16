'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  GripVertical, Plus, Trash2, ChevronUp, ChevronDown, ChevronLeft, Pencil, X,
  Eye, Save, Globe, Layout, Sparkles, Image, MapPin, Phone,
  BarChart3, CreditCard, HelpCircle, Play, Megaphone, Building2,
  MessageSquare, Star, Clock, CheckCircle2, ExternalLink,
  Crown, Landmark, Palmtree, Factory, Home, TrendingUp, Gem,
  ShieldCheck, Waves, Mountain, Hotel,
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ─── Types ─── */

type SectionType =
  | 'hero' | 'gallery' | 'features' | 'location' | 'contact'
  | 'stats' | 'pricing' | 'faq' | 'video' | 'cta'
  | 'floor_plan' | 'testimonials'

interface Section {
  id: string
  type: SectionType
  data: Record<string, any>
}

/* ─── Section Registry ─── */

const SECTION_REGISTRY: Record<SectionType, {
  label: string
  icon: typeof Layout
  category: 'content' | 'media' | 'conversion' | 'info'
  defaults: Record<string, any>
}> = {
  hero: {
    label: 'Hero Banner',
    icon: Layout,
    category: 'content',
    defaults: { headline: '', subheadline: '', cta_text: 'Book Now', bg_style: 'gradient_dark' },
  },
  stats: {
    label: 'Stats / Counters',
    icon: BarChart3,
    category: 'content',
    defaults: {
      items: [
        { label: 'Total Units', value: '96' },
        { label: 'Floors', value: '24' },
        { label: 'Starting From', value: '৳ 85 Lac' },
        { label: 'Ready By', value: '2027' },
      ],
    },
  },
  gallery: {
    label: 'Image Gallery',
    icon: Image,
    category: 'media',
    defaults: { title: 'Project Gallery', image_urls: [], layout: 'grid' },
  },
  video: {
    label: 'Video Embed',
    icon: Play,
    category: 'media',
    defaults: { title: 'Project Video', video_url: '', caption: '' },
  },
  features: {
    label: 'Features & Amenities',
    icon: Sparkles,
    category: 'content',
    defaults: { title: 'Key Features', items: [] },
  },
  floor_plan: {
    label: 'Floor Plans',
    icon: Building2,
    category: 'content',
    defaults: {
      title: 'Floor Plans',
      plans: [
        { name: 'Type A — 3 BHK', size: '1,450 sqft', price: '৳ 85 Lac', image_url: '' },
        { name: 'Type B — 4 BHK', size: '1,850 sqft', price: '৳ 1.2 Cr', image_url: '' },
      ],
    },
  },
  pricing: {
    label: 'Pricing Table',
    icon: CreditCard,
    category: 'conversion',
    defaults: {
      title: 'Unit Pricing',
      units: [
        { type: '3 BHK', size: '1,450 sqft', price: '৳ 85,00,000', status: 'Available' },
        { type: '4 BHK', size: '1,850 sqft', price: '৳ 1,20,00,000', status: 'Available' },
      ],
    },
  },
  testimonials: {
    label: 'Testimonials',
    icon: MessageSquare,
    category: 'conversion',
    defaults: {
      title: 'What Buyers Say',
      items: [
        { name: '', quote: '', rating: 5 },
      ],
    },
  },
  faq: {
    label: 'FAQ',
    icon: HelpCircle,
    category: 'info',
    defaults: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'What is the payment plan?', answer: '' },
        { question: 'When is the expected handover?', answer: '' },
      ],
    },
  },
  location: {
    label: 'Location & Map',
    icon: MapPin,
    category: 'info',
    defaults: { title: 'Location', address: '', map_embed: '', highlights: [] },
  },
  cta: {
    label: 'CTA Banner',
    icon: Megaphone,
    category: 'conversion',
    defaults: { headline: 'Ready to Book?', subheadline: 'Contact us today for the best deals.', cta_text: 'Contact Now', phone: '' },
  },
  contact: {
    label: 'Contact',
    icon: Phone,
    category: 'info',
    defaults: { title: 'Get In Touch', phone: '', email: '', whatsapp: '' },
  },
}

const CATEGORIES = [
  { key: 'content', label: 'Content' },
  { key: 'media', label: 'Media' },
  { key: 'conversion', label: 'Conversion' },
  { key: 'info', label: 'Information' },
] as const

/* ─── Templates ─── */

interface TemplateSectionDef {
  type: SectionType
  data?: Record<string, any>  // overrides for defaults
}

interface Template {
  id: string
  name: string
  desc: string
  icon: typeof Layout
  accent: string
  tag?: string
  sections: TemplateSectionDef[]
}

const T: Template[] = [
  // ─── Premium / Luxury ───
  {
    id: 'luxury_full', name: 'Luxury Showcase', tag: 'Most Popular',
    desc: 'Complete premium layout — stats, gallery, plans, testimonials, CTA.',
    icon: Crown, accent: '#C9A96E',
    sections: [
      { type: 'hero', data: { headline: 'Live Above the Ordinary', subheadline: 'Ultra-premium residences designed for those who expect the best.', cta_text: 'Book a Visit', bg_style: 'gradient_gold' } },
      { type: 'stats', data: { items: [{ label: 'Total Units', value: '120' }, { label: 'Floors', value: '32' }, { label: 'Starting From', value: '৳ 1.8 Cr' }, { label: 'Handover', value: 'Dec 2027' }] } },
      { type: 'gallery', data: { title: 'Visual Tour', layout: 'grid' } },
      { type: 'features', data: { title: 'World-Class Amenities', items: ['Rooftop Infinity Pool', 'Private Gym & Spa', 'Smart Home Automation', '24/7 Concierge', 'Underground Parking', 'Children Play Zone', 'Prayer Room', 'EV Charging Stations'] } },
      { type: 'floor_plan', data: { title: 'Choose Your Layout', plans: [{ name: 'Royal — 4 BHK', size: '2,800 sqft', price: '৳ 2.4 Cr', image_url: '' }, { name: 'Imperial — 5 BHK Duplex', size: '4,200 sqft', price: '৳ 3.8 Cr', image_url: '' }] } },
      { type: 'testimonials', data: { title: 'Trusted by Investors', items: [{ name: 'Rahim Ahmed', quote: 'The best investment decision of my life. Build quality is outstanding.', rating: 5 }, { name: 'Nusrat Jahan', quote: 'Transparent process from booking to handover. Highly recommended.', rating: 5 }] } },
      { type: 'location', data: { title: 'Prime Location', address: 'Gulshan-2, Dhaka', highlights: ['2 min — Gulshan Circle', '5 min — US Embassy', '10 min — Airport', '3 min — International School'] } },
      { type: 'cta', data: { headline: 'Secure Your Unit Today', subheadline: 'Limited units available. Prices will increase after launch phase.', cta_text: 'Book Now' } },
      { type: 'contact' },
    ],
  },
  {
    id: 'skyline', name: 'Skyline Tower',
    desc: 'High-rise focused — stats, video walkthrough, pricing table, FAQ.',
    icon: Building2, accent: '#3B82F6',
    sections: [
      { type: 'hero', data: { headline: 'Touch the Sky', subheadline: 'Premium high-rise living in the heart of the city.', cta_text: 'Explore Units', bg_style: 'gradient_blue' } },
      { type: 'stats', data: { items: [{ label: 'Floors', value: '40' }, { label: 'Units', value: '200' }, { label: 'From', value: '৳ 95 Lac' }, { label: 'Ready', value: '2028' }] } },
      { type: 'video', data: { title: 'Project Walkthrough', caption: 'Take a virtual tour of our flagship tower.' } },
      { type: 'features', data: { title: 'Building Features', items: ['4 High-Speed Elevators', 'Central Air Conditioning', 'Fire Safety System', 'Earthquake Resistant', 'Backup Generator', 'Water Treatment Plant'] } },
      { type: 'pricing', data: { title: 'Available Units', units: [{ type: '2 BHK', size: '1,100 sqft', price: '৳ 95,00,000', status: 'Available' }, { type: '3 BHK', size: '1,550 sqft', price: '৳ 1,35,00,000', status: 'Available' }, { type: 'Penthouse', size: '3,200 sqft', price: '৳ 3,50,00,000', status: 'Available' }] } },
      { type: 'faq', data: { title: 'Common Questions', items: [{ question: 'What is the booking amount?', answer: '10% of unit price as advance payment.' }, { question: 'Is there an installment plan?', answer: 'Yes, up to 36 months installment available.' }, { question: 'When is possession?', answer: 'Expected December 2028.' }] } },
      { type: 'location', data: { title: 'Location', highlights: ['Banani, Dhaka', '5 min — DOHS', '10 min — Gulshan'] } },
      { type: 'contact' },
    ],
  },
  // ─── Residential ───
  {
    id: 'family_home', name: 'Family Residence',
    desc: 'Family-focused — features, floor plans, location highlights, testimonials.',
    icon: Home, accent: '#10B981',
    sections: [
      { type: 'hero', data: { headline: 'Where Families Flourish', subheadline: 'Spacious apartments designed for modern family living.', cta_text: 'View Plans', bg_style: 'gradient_dark' } },
      { type: 'features', data: { title: 'Family-Friendly Features', items: ['Spacious Living Areas', 'Dedicated Study Room', 'Children Playground', 'Community Hall', 'Walking Trail', 'CCTV Security', 'Intercom System', 'Rooftop Garden'] } },
      { type: 'floor_plan', data: { title: 'Apartment Layouts', plans: [{ name: 'Comfort — 3 BHK', size: '1,350 sqft', price: '৳ 75 Lac', image_url: '' }, { name: 'Premium — 4 BHK', size: '1,750 sqft', price: '৳ 1.05 Cr', image_url: '' }, { name: 'Deluxe — 4 BHK + Maid', size: '2,100 sqft', price: '৳ 1.3 Cr', image_url: '' }] } },
      { type: 'gallery' },
      { type: 'testimonials', data: { title: 'Happy Families', items: [{ name: 'Karim Family', quote: 'Perfect for our growing family. The playground keeps our kids happy.', rating: 5 }] } },
      { type: 'location', data: { title: 'Neighborhood', highlights: ['Near top schools', '5 min — Hospital', 'Quiet residential area', 'Parks nearby'] } },
      { type: 'contact' },
    ],
  },
  {
    id: 'affordable', name: 'Affordable Living',
    desc: 'Budget-friendly — pricing table, installment FAQ, simple layout.',
    icon: TrendingUp, accent: '#F59E0B',
    sections: [
      { type: 'hero', data: { headline: 'Your Dream Home, Within Reach', subheadline: 'Quality apartments at prices that make sense. Easy installment plans available.', cta_text: 'Check Prices', bg_style: 'gradient_dark' } },
      { type: 'stats', data: { items: [{ label: 'Starting', value: '৳ 35 Lac' }, { label: 'EMI From', value: '৳ 25K/mo' }, { label: 'Units', value: '48' }, { label: 'Ready', value: '2026' }] } },
      { type: 'pricing', data: { title: 'Transparent Pricing', units: [{ type: '2 BHK', size: '850 sqft', price: '৳ 35,00,000', status: 'Available' }, { type: '3 BHK', size: '1,100 sqft', price: '৳ 48,00,000', status: 'Available' }] } },
      { type: 'features', data: { title: 'What You Get', items: ['Tiles Flooring', 'Fitted Kitchen', 'Lift Access', 'Generator Backup', 'Guard Service', 'Gas Connection'] } },
      { type: 'faq', data: { title: 'Payment FAQ', items: [{ question: 'What is the minimum down payment?', answer: '15% of the total price.' }, { question: 'Can I pay in installments?', answer: 'Yes, up to 48 months installment with 0% interest during construction.' }, { question: 'Are there any hidden charges?', answer: 'No hidden charges. All costs are transparent.' }] } },
      { type: 'location' },
      { type: 'contact' },
    ],
  },
  // ─── Commercial ───
  {
    id: 'commercial_hub', name: 'Commercial Hub',
    desc: 'Office/retail space — stats, pricing, features, location for businesses.',
    icon: Factory, accent: '#6366F1',
    sections: [
      { type: 'hero', data: { headline: 'Your Next Business Address', subheadline: 'Grade-A commercial spaces in prime business districts.', cta_text: 'Lease Now', bg_style: 'gradient_blue' } },
      { type: 'stats', data: { items: [{ label: 'Office Floors', value: '18' }, { label: 'Retail Spaces', value: '24' }, { label: 'From', value: '৳ 8K/sqft' }, { label: 'Occupancy', value: '85%' }] } },
      { type: 'features', data: { title: 'Business Features', items: ['Central AC', 'High-Speed Internet Ready', 'Conference Rooms', 'Basement Parking', 'Power Backup 100%', 'Fire Suppression', 'Loading Dock', 'Food Court'] } },
      { type: 'pricing', data: { title: 'Space Options', units: [{ type: 'Small Office', size: '500 sqft', price: '৳ 40,00,000', status: 'Available' }, { type: 'Large Office', size: '1,200 sqft', price: '৳ 96,00,000', status: 'Available' }, { type: 'Retail Shop', size: '350 sqft', price: '৳ 45,00,000', status: 'Available' }] } },
      { type: 'location', data: { title: 'Business District', highlights: ['Motijheel, Dhaka', 'Near Stock Exchange', '2 min — Bank Row', 'Metro Station Nearby'] } },
      { type: 'cta', data: { headline: 'Invest in Prime Commercial Real Estate', subheadline: 'High ROI guaranteed. Limited spaces left.', cta_text: 'Schedule Visit' } },
      { type: 'contact' },
    ],
  },
  // ─── Lifestyle / Resort ───
  {
    id: 'waterfront', name: 'Waterfront Living',
    desc: 'Riverside/lakefront — scenic hero, gallery, features, testimonials.',
    icon: Waves, accent: '#06B6D4',
    sections: [
      { type: 'hero', data: { headline: 'Wake Up to the Water', subheadline: 'Exclusive waterfront residences with panoramic river views.', cta_text: 'Explore', bg_style: 'gradient_blue' } },
      { type: 'gallery', data: { title: 'Life by the Water', layout: 'masonry' } },
      { type: 'stats', data: { items: [{ label: 'River Front', value: '500ft' }, { label: 'Units', value: '64' }, { label: 'Green Area', value: '40%' }, { label: 'From', value: '৳ 1.5 Cr' }] } },
      { type: 'features', data: { title: 'Waterfront Amenities', items: ['Private Jetty', 'Riverside Walking Path', 'Infinity Pool', 'Yacht Club Access', 'Open-Air Restaurant', 'Sunset Lounge', 'Fishing Deck', 'Spa & Wellness'] } },
      { type: 'floor_plan' },
      { type: 'testimonials', data: { title: 'Resident Stories', items: [{ name: 'Dr. Hasan', quote: 'The view from my balcony is something I never imagined owning. Priceless.', rating: 5 }] } },
      { type: 'contact' },
    ],
  },
  {
    id: 'resort', name: 'Resort Villa',
    desc: 'Vacation/resort property — scenic, gallery-heavy, relaxed tone.',
    icon: Palmtree, accent: '#22C55E',
    sections: [
      { type: 'hero', data: { headline: 'Your Private Escape', subheadline: 'Resort-style villas nestled in nature. Weekend retreats or permanent living.', cta_text: 'Book a Tour', bg_style: 'gradient_dark' } },
      { type: 'gallery', data: { title: 'Villa Gallery', layout: 'slider' } },
      { type: 'features', data: { title: 'Resort Amenities', items: ['Private Pool', 'BBQ Area', 'Lush Gardens', 'Clubhouse', 'Tennis Court', 'Cycling Trail', 'Pet Friendly', 'On-site Restaurant'] } },
      { type: 'stats', data: { items: [{ label: 'Villas', value: '30' }, { label: 'Plot Size', value: '5-10 Katha' }, { label: 'From', value: '৳ 80 Lac' }, { label: 'Location', value: 'Gazipur' }] } },
      { type: 'location', data: { title: 'Escape the City', address: 'Gazipur, 45 min from Dhaka', highlights: ['45 min — Dhaka city', 'Near national park', 'Fresh air zone', 'Low pollution area'] } },
      { type: 'cta', data: { headline: 'Limited Plots Available', subheadline: 'Secure your weekend escape before prices increase.', cta_text: 'Reserve Now' } },
      { type: 'contact' },
    ],
  },
  // ─── Plot / Land ───
  {
    id: 'plot_sale', name: 'Land & Plot',
    desc: 'Plot/land sales — stats, pricing, location focus, investment pitch.',
    icon: Landmark, accent: '#A855F7',
    sections: [
      { type: 'hero', data: { headline: 'Own a Piece of Tomorrow', subheadline: 'Residential and commercial plots in rapidly developing zones.', cta_text: 'View Plots', bg_style: 'gradient_dark' } },
      { type: 'stats', data: { items: [{ label: 'Total Plots', value: '150' }, { label: 'From', value: '৳ 12 Lac' }, { label: 'Per Katha', value: '৳ 6 Lac' }, { label: 'Road Width', value: '25 ft' }] } },
      { type: 'pricing', data: { title: 'Plot Options', units: [{ type: '3 Katha', size: 'Residential', price: '৳ 18,00,000', status: 'Available' }, { type: '5 Katha', size: 'Residential', price: '৳ 30,00,000', status: 'Available' }, { type: '10 Katha', size: 'Commercial', price: '৳ 80,00,000', status: 'Available' }] } },
      { type: 'features', data: { title: 'Development Features', items: ['Wide Roads', 'Underground Drainage', 'Street Lights', 'Boundary Wall', 'Guard Post', 'Mosque', 'Park Area', 'Utility Connections Ready'] } },
      { type: 'location', data: { title: 'Strategic Location', highlights: ['Near Highway', 'Upcoming Metro Route', 'School & Hospital Nearby', 'Rapidly Appreciating Zone'] } },
      { type: 'faq', data: { title: 'Land Purchase FAQ', items: [{ question: 'Is the title clear?', answer: 'Yes, all plots have clear title with registered deed.' }, { question: 'Can I build immediately?', answer: 'Yes, all utility connections are ready.' }] } },
      { type: 'contact' },
    ],
  },
  // ─── Specialized ───
  {
    id: 'student_housing', name: 'Student Housing',
    desc: 'Near-campus housing — affordable, features focused, FAQ heavy.',
    icon: Home, accent: '#EC4899',
    sections: [
      { type: 'hero', data: { headline: 'Study. Live. Thrive.', subheadline: 'Modern student apartments near top universities.', cta_text: 'Apply Now', bg_style: 'gradient_dark' } },
      { type: 'stats', data: { items: [{ label: 'Rooms', value: '200' }, { label: 'From', value: '৳ 8K/mo' }, { label: 'WiFi', value: 'Free' }, { label: 'Walk to Campus', value: '5 min' }] } },
      { type: 'features', data: { title: 'Student Perks', items: ['High-Speed WiFi', 'Study Lounge', 'Laundry Room', 'Cafeteria', 'Security Guard 24/7', 'Furnished Rooms', 'Common Kitchen', 'Bike Parking'] } },
      { type: 'faq', data: { title: 'Student FAQ', items: [{ question: 'Is there a minimum lease?', answer: '6 months minimum.' }, { question: 'Can I share a room?', answer: 'Yes, shared rooms available at lower rates.' }, { question: 'Is furniture included?', answer: 'Yes, all rooms come fully furnished.' }] } },
      { type: 'location', data: { title: 'Near Campus', highlights: ['5 min walk to university', 'Near libraries', 'Food street nearby', 'Bus stop at gate'] } },
      { type: 'contact' },
    ],
  },
  {
    id: 'serviced_apartment', name: 'Serviced Apartment',
    desc: 'Short/long-term rentals — hotel-style amenities, pricing, FAQ.',
    icon: Hotel, accent: '#F97316',
    sections: [
      { type: 'hero', data: { headline: 'Hotel Comfort. Home Privacy.', subheadline: 'Fully serviced apartments for business travelers and expats.', cta_text: 'Check Availability', bg_style: 'gradient_gold' } },
      { type: 'stats', data: { items: [{ label: 'Apartments', value: '50' }, { label: 'From', value: '৳ 3,500/night' }, { label: 'Occupancy', value: '92%' }, { label: 'Rating', value: '4.8★' }] } },
      { type: 'features', data: { title: 'Services Included', items: ['Daily Housekeeping', 'Complimentary Breakfast', 'Concierge Desk', 'Airport Transfer', 'Laundry Service', 'Business Center', 'Gym Access', 'Room Service'] } },
      { type: 'pricing', data: { title: 'Stay Options', units: [{ type: 'Studio', size: '450 sqft', price: '৳ 3,500/night', status: 'Available' }, { type: '1 Bedroom', size: '750 sqft', price: '৳ 5,500/night', status: 'Available' }, { type: 'Executive Suite', size: '1,200 sqft', price: '৳ 9,000/night', status: 'Available' }] } },
      { type: 'testimonials', data: { title: 'Guest Reviews', items: [{ name: 'James Miller', quote: 'Better than any hotel. Felt like home from day one.', rating: 5 }, { name: 'Fatima Khan', quote: 'Perfect for my 3-month work assignment. Will definitely return.', rating: 4 }] } },
      { type: 'contact' },
    ],
  },
  {
    id: 'investment', name: 'Investment Pitch',
    desc: 'Investor-focused — ROI stats, testimonials, urgency CTA.',
    icon: TrendingUp, accent: '#EF4444',
    sections: [
      { type: 'hero', data: { headline: 'Smart Money Invests Here', subheadline: 'Proven ROI in Bangladesh\'s fastest-growing real estate corridor.', cta_text: 'See Returns', bg_style: 'gradient_gold' } },
      { type: 'stats', data: { items: [{ label: 'Avg ROI', value: '22%' }, { label: 'Projects Delivered', value: '15' }, { label: 'Happy Investors', value: '500+' }, { label: 'Min Investment', value: '৳ 25 Lac' }] } },
      { type: 'features', data: { title: 'Why Invest With Us', items: ['Guaranteed Buyback Option', 'Rental Income Management', 'Legal Documentation Support', 'Tax Advisory', 'Quarterly Progress Reports', 'Referral Bonus Program'] } },
      { type: 'testimonials', data: { title: 'Investor Testimonials', items: [{ name: 'Arif Hossain', quote: 'My property value increased 35% in 2 years. Best investment.', rating: 5 }, { name: 'Sabina Akter', quote: 'Transparent process. I get rental income every month without hassle.', rating: 5 }] } },
      { type: 'cta', data: { headline: 'Early Bird Pricing Ends Soon', subheadline: 'Lock in today\'s price. Values projected to increase 15% post-launch.', cta_text: 'Invest Now' } },
      { type: 'faq', data: { title: 'Investor FAQ', items: [{ question: 'What is the expected ROI?', answer: 'Historical average 18-25% over 3 years.' }, { question: 'Is there a rental guarantee?', answer: 'Yes, 7% annual rental yield guaranteed for first 2 years.' }] } },
      { type: 'contact' },
    ],
  },
  // ─── Simple / Utility ───
  {
    id: 'video_first', name: 'Video Showcase',
    desc: 'Video-centric — hero, video, gallery, features, contact.',
    icon: Play, accent: '#8B5CF6',
    sections: [
      { type: 'hero', data: { headline: 'See It to Believe It', subheadline: 'Watch our project come to life through immersive video content.', cta_text: 'Watch Now', bg_style: 'gradient_dark' } },
      { type: 'video', data: { title: 'Project Walkthrough', caption: 'Full 4K tour of the construction site and model apartment.' } },
      { type: 'gallery', data: { title: 'Project Photos', layout: 'masonry' } },
      { type: 'features', data: { title: 'Highlights', items: ['Premium Finish', 'Imported Fittings', 'European Kitchen', 'Hardwood Flooring', 'Smart Locks', 'Solar Ready'] } },
      { type: 'contact' },
    ],
  },
  {
    id: 'coming_soon', name: 'Coming Soon',
    desc: 'Pre-launch teaser — minimal info, contact form, CTA to register interest.',
    icon: Clock, accent: '#F59E0B',
    sections: [
      { type: 'hero', data: { headline: 'Something Extraordinary is Coming', subheadline: 'A landmark project launching soon. Register now for early access and exclusive pricing.', cta_text: 'Register Interest', bg_style: 'gradient_gold' } },
      { type: 'stats', data: { items: [{ label: 'Launch', value: 'Q3 2026' }, { label: 'Location', value: 'Uttara' }, { label: 'Early Bird', value: '15% Off' }] } },
      { type: 'cta', data: { headline: 'Be the First to Know', subheadline: 'Early registrants get priority booking and launch-day pricing.', cta_text: 'Register Now' } },
      { type: 'contact' },
    ],
  },
  {
    id: 'minimal_clean', name: 'Minimal Clean',
    desc: 'Lightweight — just hero, features, location, contact.',
    icon: Star, accent: '#10B981',
    sections: [
      { type: 'hero', data: { headline: 'Simple. Elegant. Yours.', subheadline: 'No-frills living with everything you need.', cta_text: 'Learn More', bg_style: 'gradient_dark' } },
      { type: 'features', data: { title: 'Key Features', items: ['Modern Design', 'Open Floor Plan', 'Natural Light', 'Quality Construction', 'Secure Parking', 'Green Spaces'] } },
      { type: 'location' },
      { type: 'contact' },
    ],
  },
  {
    id: 'blank', name: 'Blank Canvas',
    desc: 'Start from scratch. Add sections one by one from the sidebar.',
    icon: Plus, accent: '#9E9AA0',
    sections: [],
  },
]

const TEMPLATES = T

/* ─── Main Component ─── */

export function LandingPageBuilder({ projectId, projectSlug, projectName, initialSections, initialSlug, isPublished }: {
  projectId: string
  projectSlug: string
  projectName: string
  initialSections: Section[]
  initialSlug: string
  isPublished: boolean
}) {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [customSlug, setCustomSlug] = useState(initialSlug || projectSlug)
  const [published, setPublished] = useState(isPublished)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragItem = useRef<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  /* ── Template apply ── */
  function applyTemplate(tmpl: Template) {
    const newSections: Section[] = tmpl.sections.map(def => ({
      id: crypto.randomUUID(),
      type: def.type,
      data: { ...SECTION_REGISTRY[def.type].defaults, ...(def.data ?? {}) },
    }))
    setSections(newSections)
    setLeftTab('layers')
    if (newSections.length) setEditingId(newSections[0].id)
    toast.success(`"${tmpl.name}" template applied`)
  }

  /* ── Section CRUD ── */
  function addSection(type: SectionType) {
    const sec: Section = { id: crypto.randomUUID(), type, data: { ...SECTION_REGISTRY[type].defaults } }
    setSections(p => [...p, sec])
    setEditingId(sec.id)
  }

  function removeSection(id: string) {
    setSections(p => p.filter(s => s.id !== id))
    if (editingId === id) setEditingId(null)
  }

  function moveSection(id: string, dir: 'up' | 'down') {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const arr = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
      return arr
    })
  }

  function updateSectionData(id: string, data: Record<string, any>) {
    setSections(p => p.map(s => s.id === id ? { ...s, data: { ...s.data, ...data } } : s))
  }

  /* ── Drag & Drop ── */
  const handleDragStart = useCallback((id: string) => { dragItem.current = id }, [])

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverId(id)
  }, [])

  const handleDrop = useCallback((targetId: string) => {
    const srcId = dragItem.current
    if (!srcId || srcId === targetId) { setDragOverId(null); return }
    setSections(prev => {
      const arr = [...prev]
      const srcIdx = arr.findIndex(s => s.id === srcId)
      const tgtIdx = arr.findIndex(s => s.id === targetId)
      const [moved] = arr.splice(srcIdx, 1)
      arr.splice(tgtIdx, 0, moved)
      return arr
    })
    dragItem.current = null
    setDragOverId(null)
  }, [])

  /* ── Save & Publish ── */
  async function save() {
    setSaving(true)
    const { data: existing } = await supabase
      .from('landing_pages').select('id').eq('project_id', projectId).single()

    if (existing) {
      await supabase.from('landing_pages')
        .update({ sections, custom_slug: customSlug, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase.from('landing_pages')
        .insert({ project_id: projectId, sections, custom_slug: customSlug })
    }
    toast.success('Saved')
    setSaving(false)
    router.refresh()
  }

  async function togglePublish() {
    setPublishing(true)
    const { data: existing } = await supabase
      .from('landing_pages').select('id').eq('project_id', projectId).single()
    if (!existing) await save()
    await supabase.from('landing_pages')
      .update({ is_published: !published }).eq('project_id', projectId)
    setPublished(p => !p)
    setPublishing(false)
    toast.success(published ? 'Unpublished' : 'Published')
    router.refresh()
  }

  const [leftTab, setLeftTab] = useState<'elements' | 'templates' | 'layers'>(
    !initialSections.length ? 'templates' : 'layers'
  )

  /* ── Template Selector (inline in left panel) ── */
  function TemplatesPanel() {
    return (
      <div className="space-y-3 p-3">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
          15 Ready-Made Templates
        </p>
        {TEMPLATES.map(tmpl => {
          const Icon = tmpl.icon
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              className="group relative w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.04]"
            >
              {tmpl.tag && (
                <span className="absolute -top-1.5 right-2 rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[8px] font-bold text-[#0A0A0F]">
                  {tmpl.tag}
                </span>
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-lg" style={{ background: `${tmpl.accent}20` }}>
                  <Icon className="size-3" style={{ color: tmpl.accent }} />
                </div>
                <span className="text-xs font-semibold text-[var(--text-primary)]">{tmpl.name}</span>
              </div>
              <p className="text-[10px] leading-4 text-[var(--text-tertiary)]">{tmpl.desc}</p>
              <p className="mt-1 text-[9px] text-[var(--text-tertiary)]">{tmpl.sections.length} sections</p>
            </button>
          )
        })}
      </div>
    )
  }

  /* ── Layers panel (drag-and-drop section list) ── */
  function LayersPanel() {
    return (
      <div className="p-3 space-y-1.5">
        <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          {sections.length} Section{sections.length !== 1 ? 's' : ''}
        </p>
        {sections.length === 0 && (
          <p className="px-1 text-xs text-[var(--text-tertiary)]">
            Add blocks or pick a template to start.
          </p>
        )}
        {sections.map((section, idx) => {
          const reg = SECTION_REGISTRY[section.type]
          const Icon = reg.icon
          const COLORS: Record<string, string> = { content: '#C9A96E', media: '#3B82F6', conversion: '#10B981', info: '#8B5CF6' }
          const color = COLORS[reg.category] ?? '#C9A96E'
          return (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(section.id)}
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDragEnd={() => setDragOverId(null)}
              onDrop={() => handleDrop(section.id)}
              onClick={() => setEditingId(editingId === section.id ? null : section.id)}
              className={`group flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 transition ${
                editingId === section.id
                  ? 'border-[var(--color-accent)] bg-[rgba(201,169,110,0.06)]'
                  : dragOverId === section.id
                    ? 'border-[var(--color-accent)] bg-[rgba(201,169,110,0.04)]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
              }`}
            >
              <GripVertical className="size-3.5 shrink-0 cursor-grab text-[var(--text-tertiary)]" />
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md" style={{ background: `${color}18` }}>
                <Icon className="size-3" style={{ color }} />
              </div>
              <span className="flex-1 truncate text-xs font-medium text-[var(--text-secondary)]">{reg.label}</span>
              <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={e => { e.stopPropagation(); moveSection(section.id, 'up') }} disabled={idx === 0}
                  className="rounded p-1 text-[var(--text-tertiary)] hover:bg-white/[0.06] disabled:opacity-20">
                  <ChevronUp className="size-3" />
                </button>
                <button type="button" onClick={e => { e.stopPropagation(); moveSection(section.id, 'down') }} disabled={idx === sections.length - 1}
                  className="rounded p-1 text-[var(--text-tertiary)] hover:bg-white/[0.06] disabled:opacity-20">
                  <ChevronDown className="size-3" />
                </button>
                <button type="button" onClick={e => { e.stopPropagation(); removeSection(section.id) }}
                  className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[rgba(244,63,94,0.08)] hover:text-[#f43f5e]">
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          )
        })}
        <button type="button" onClick={() => setLeftTab('elements')}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/[0.06] py-2.5 text-[10px] text-[var(--text-tertiary)] transition hover:border-[rgba(201,169,110,0.2)] hover:text-[var(--color-accent)]">
          <Plus className="size-3" /> Add section
        </button>
      </div>
    )
  }

  const activeSection = sections.find(s => s.id === editingId) ?? null

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden rounded-2xl border border-white/[0.06]" style={{ background: '#0D0D14' }}>

      {/* ── Top Bar ── */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4" style={{ background: '#111118' }}>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="shrink-0 text-[10px] text-[var(--text-tertiary)]">/projects/</span>
          <input
            value={customSlug}
            onChange={e => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="h-7 min-w-0 max-w-[180px] rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-[var(--text-primary)] outline-none focus:border-[rgba(201,169,110,0.3)]"
            placeholder="project-slug"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-[var(--text-tertiary)]">
            {sections.length} section{sections.length !== 1 ? 's' : ''}
          </span>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-white/[0.08] disabled:opacity-50">
            <Save className="size-3" />
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={togglePublish} disabled={publishing}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
              published
                ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981] ring-1 ring-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.18)]'
                : 'bg-[rgba(201,169,110,0.14)] text-[var(--color-accent)] ring-1 ring-[rgba(201,169,110,0.2)] hover:bg-[rgba(201,169,110,0.22)]'
            }`}>
            <Globe className="size-3" />
            {publishing ? '…' : published ? '✓ Published' : 'Publish'}
          </button>
          {published && (
            <Link href={`/projects/${customSlug}`} target="_blank"
              className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-[var(--color-accent)] transition hover:bg-white/[0.08]">
              <ExternalLink className="size-3" />
              View Live
            </Link>
          )}
        </div>
      </div>

      {/* ── Body: Left controls + Right live preview ── */}
      <div className="flex min-h-0 flex-1">

        {/* LEFT PANEL */}
        <div className="flex w-[280px] shrink-0 flex-col border-r border-white/[0.06]" style={{ background: '#111118' }}>
          {activeSection ? (
            <>
              {/* Section editor header */}
              <div className="flex h-10 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3">
                <button type="button" onClick={() => setEditingId(null)}
                  className="flex size-7 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]">
                  <ChevronLeft className="size-4" />
                </button>
                {(() => { const Icon = SECTION_REGISTRY[activeSection.type].icon; return <Icon className="size-3.5 text-[var(--color-accent)]" /> })()}
                <span className="flex-1 text-xs font-semibold text-[var(--text-primary)]">
                  {SECTION_REGISTRY[activeSection.type].label}
                </span>
              </div>
              {/* Editor form */}
              <div className="flex-1 overflow-y-auto p-4">
                <SectionEditor
                  section={activeSection}
                  onChange={data => updateSectionData(activeSection.id, data)}
                />
              </div>
              {/* Remove button */}
              <div className="border-t border-white/[0.06] p-3">
                <button type="button" onClick={() => removeSection(activeSection.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(244,63,94,0.15)] bg-[rgba(244,63,94,0.06)] py-2 text-xs font-semibold text-[#f43f5e] transition hover:bg-[rgba(244,63,94,0.1)]">
                  <Trash2 className="size-3.5" />
                  Remove section
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Tabs: Blocks | Templates | Layers */}
              <div className="flex h-10 shrink-0 border-b border-white/[0.06]">
                {(['elements', 'templates', 'layers'] as const).map(tab => (
                  <button key={tab} type="button" onClick={() => setLeftTab(tab)}
                    className={`flex flex-1 items-center justify-center text-[10px] font-semibold uppercase tracking-wider transition ${
                      leftTab === tab
                        ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}>
                    {tab === 'elements' ? 'Blocks' : tab === 'templates' ? 'Templates' : 'Layers'}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {leftTab === 'elements' && (
                  <div className="space-y-4 p-3">
                    {CATEGORIES.map(cat => {
                      const items = (Object.entries(SECTION_REGISTRY) as [SectionType, typeof SECTION_REGISTRY['hero']][])
                        .filter(([, reg]) => reg.category === cat.key)
                      return (
                        <div key={cat.key}>
                          <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                            {cat.label}
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {items.map(([type, reg]) => {
                              const SIcon = reg.icon
                              return (
                                <button key={type} type="button" onClick={() => addSection(type)}
                                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-center transition hover:border-[rgba(201,169,110,0.25)] hover:bg-[rgba(201,169,110,0.06)]">
                                  <div className="flex size-7 items-center justify-center rounded-lg bg-[rgba(201,169,110,0.1)]">
                                    <SIcon className="size-3.5 text-[var(--color-accent)]" />
                                  </div>
                                  <span className="text-[9px] font-semibold leading-tight text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                                    {reg.label}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {leftTab === 'templates' && <TemplatesPanel />}
                {leftTab === 'layers' && <LayersPanel />}
              </div>
            </>
          )}
        </div>

        {/* RIGHT PANEL — Live Preview */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Preview toolbar */}
          <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.06] px-4" style={{ background: '#0F0F16' }}>
            <Eye className="size-3.5 text-[var(--text-tertiary)]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Live Preview</span>
            {sections.length > 0 && (
              <span className="ml-auto text-[10px] text-[var(--text-tertiary)]">Click a section to edit</span>
            )}
          </div>

          {/* Preview canvas — white background like a real website */}
          <div className="flex-1 overflow-y-auto bg-white">
            {!sections.length ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-gray-100">
                  <Layout className="size-7 text-gray-300" />
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Your page is empty</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Add blocks from{' '}
                    <button type="button" onClick={() => setLeftTab('elements')} className="text-[#C9A96E] underline underline-offset-2">Blocks</button>
                    {' '}or{' '}
                    <button type="button" onClick={() => setLeftTab('templates')} className="text-[#C9A96E] underline underline-offset-2">pick a template</button>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {sections.map(section => (
                  <div
                    key={section.id}
                    onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                    className={`group relative cursor-pointer transition-all ${
                      editingId === section.id
                        ? 'outline outline-2 outline-offset-[-2px] outline-[#C9A96E]'
                        : 'outline outline-2 outline-offset-[-2px] outline-transparent hover:outline-[rgba(201,169,110,0.5)]'
                    }`}
                  >
                    {/* Section label badge */}
                    <div className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold shadow-sm transition-opacity ${
                      editingId === section.id
                        ? 'bg-[#C9A96E] text-[#0A0A0F] opacity-100'
                        : 'bg-white/90 text-gray-600 opacity-0 group-hover:opacity-100'
                    }`}>
                      <Pencil className="size-2.5" />
                      {SECTION_REGISTRY[section.type].label}
                    </div>
                    <SectionPreview section={section} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ─── Section Preview (renders in the live preview panel) ─── */

function SectionPreview({ section }: { section: Section }) {
  const { type, data } = section

  if (type === 'hero') {
    const bgMap: Record<string, string> = {
      gradient_dark: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
      gradient_blue: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
      gradient_gold: 'linear-gradient(135deg, #1a1200 0%, #3d2900 100%)',
      solid_dark: '#0a0a0f',
    }
    const bg = bgMap[data.bg_style] ?? bgMap.gradient_dark
    return (
      <div style={{ background: bg }} className="flex min-h-[260px] flex-col items-center justify-center px-8 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
          {data.headline || <span className="opacity-30">Headline goes here</span>}
        </h1>
        {data.subheadline && <p className="mb-8 max-w-xl text-lg text-white/70">{data.subheadline}</p>}
        <button className="rounded-full px-8 py-3 text-sm font-semibold text-black" style={{ background: '#C9A96E' }}>
          {data.cta_text || 'Book Now'}
        </button>
      </div>
    )
  }

  if (type === 'stats') {
    return (
      <div className="bg-gray-900 px-8 py-10">
        <div className="mx-auto grid max-w-3xl gap-6" style={{ gridTemplateColumns: `repeat(${Math.min((data.items as any[]).length, 4)}, 1fr)` }}>
          {(data.items as any[]).map((item: any, i: number) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#C9A96E' }}>{item.value || '—'}</p>
              <p className="mt-1 text-sm text-gray-400">{item.label || ''}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'gallery') {
    const hasImages = (data.image_urls as string[])?.length > 0
    return (
      <div className="bg-gray-50 px-8 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{data.title || 'Gallery'}</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-3">
          {hasImages
            ? (data.image_urls as string[]).slice(0, 6).map((url: string, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" className="h-36 w-full rounded-xl object-cover" />
              ))
            : [...Array(6)].map((_, i) => (
                <div key={i} className="flex h-36 w-full items-center justify-center rounded-xl bg-gray-200">
                  <Image className="size-8 text-gray-300" />
                </div>
              ))
          }
        </div>
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div className="bg-gray-900 px-8 py-12 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">{data.title || 'Project Video'}</h2>
        {data.caption && <p className="mb-6 text-gray-400">{data.caption}</p>}
        {data.video_url ? (
          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl">
            <iframe src={data.video_url} className="h-64 w-full" allowFullScreen />
          </div>
        ) : (
          <div className="mx-auto flex h-48 max-w-2xl items-center justify-center rounded-2xl bg-gray-800">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
              <Play className="size-8 text-white" />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (type === 'features') {
    return (
      <div className="bg-white px-8 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{data.title || 'Features'}</h2>
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
          {(data.items as string[] ?? []).map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
              <CheckCircle2 className="size-4 shrink-0" style={{ color: '#C9A96E' }} />
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
          {!data.items?.length && (
            <p className="col-span-3 text-center text-sm text-gray-400">No features added yet</p>
          )}
        </div>
      </div>
    )
  }

  if (type === 'floor_plan') {
    return (
      <div className="bg-gray-50 px-8 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{data.title || 'Floor Plans'}</h2>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {(data.plans as any[] ?? []).map((plan: any, i: number) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              {plan.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={plan.image_url} alt="" className="mb-4 h-32 w-full rounded-xl object-cover" />
              )}
              <p className="font-bold text-gray-900">{plan.name || 'Plan Type'}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">{plan.size || ''}</span>
                <span className="font-semibold" style={{ color: '#C9A96E' }}>{plan.price || ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'pricing') {
    return (
      <div className="bg-white px-8 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{data.title || 'Pricing'}</h2>
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Type</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Size</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Price</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.units as any[] ?? []).map((unit: any, i: number) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-6 py-4 font-medium text-gray-900">{unit.type}</td>
                  <td className="px-6 py-4 text-gray-500">{unit.size}</td>
                  <td className="px-6 py-4 font-semibold" style={{ color: '#C9A96E' }}>{unit.price}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      unit.status === 'Available' ? 'bg-green-100 text-green-700' :
                      unit.status === 'Booked' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{unit.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (type === 'testimonials') {
    return (
      <div className="bg-gray-50 px-8 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{data.title || 'Testimonials'}</h2>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {(data.items as any[] ?? []).map((item: any, i: number) => (
            <div key={i} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex">
                {[...Array(item.rating ?? 5)].map((_, j) => (
                  <Star key={j} className="size-4 fill-current" style={{ color: '#C9A96E' }} />
                ))}
              </div>
              <p className="mb-4 italic text-sm text-gray-600">"{item.quote || 'Great experience!'}"</p>
              <p className="text-sm font-semibold text-gray-900">{item.name || 'Anonymous'}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'faq') {
    return (
      <div className="bg-white px-8 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{data.title || 'FAQ'}</h2>
        <div className="mx-auto max-w-2xl space-y-3">
          {(data.items as any[] ?? []).map((item: any, i: number) => (
            <div key={i} className="rounded-xl border border-gray-200 px-6 py-4">
              <p className="font-semibold text-gray-900">{item.question || 'Question'}</p>
              {item.answer && <p className="mt-2 text-sm text-gray-500">{item.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'location') {
    return (
      <div className="bg-gray-50 px-8 py-12">
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">{data.title || 'Location'}</h2>
        {data.address && <p className="mb-6 text-center text-gray-500">{data.address}</p>}
        {data.map_embed ? (
          <div className="mx-auto mb-6 max-w-2xl overflow-hidden rounded-2xl">
            <iframe src={data.map_embed} className="h-48 w-full" title="map" />
          </div>
        ) : (
          <div className="mx-auto mb-6 flex h-40 max-w-2xl items-center justify-center rounded-2xl bg-gray-200">
            <MapPin className="size-8 text-gray-400" />
          </div>
        )}
        {(data.highlights as string[])?.length > 0 && (
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2">
            {(data.highlights as string[]).map((h: string, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
                <CheckCircle2 className="size-3.5 shrink-0" style={{ color: '#C9A96E' }} />
                {h}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (type === 'cta') {
    return (
      <div className="px-8 py-16 text-center" style={{ background: 'linear-gradient(135deg, #1a1200 0%, #3d2900 100%)' }}>
        <h2 className="mb-4 text-3xl font-bold text-white">{data.headline || 'Ready to Book?'}</h2>
        {data.subheadline && <p className="mb-8 text-lg text-white/70">{data.subheadline}</p>}
        <button className="rounded-full px-10 py-4 text-sm font-bold text-black" style={{ background: '#C9A96E' }}>
          {data.cta_text || 'Contact Now'}
        </button>
      </div>
    )
  }

  if (type === 'contact') {
    return (
      <div className="bg-gray-900 px-8 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">{data.title || 'Contact Us'}</h2>
        <div className="mx-auto flex max-w-md flex-col gap-3">
          {data.phone && (
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-5 py-3">
              <Phone className="size-4" style={{ color: '#C9A96E' }} />
              <span className="text-sm text-white">{data.phone}</span>
            </div>
          )}
          {data.email && (
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-5 py-3">
              <MessageSquare className="size-4" style={{ color: '#C9A96E' }} />
              <span className="text-sm text-white">{data.email}</span>
            </div>
          )}
          {data.whatsapp && (
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-5 py-3">
              <Phone className="size-4 text-green-400" />
              <span className="text-sm text-white">WhatsApp: {data.whatsapp}</span>
            </div>
          )}
          {!data.phone && !data.email && !data.whatsapp && (
            <p className="text-center text-sm text-gray-500">Add contact details in the editor</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-20 items-center justify-center bg-gray-50 text-sm text-gray-400">
      {(SECTION_REGISTRY as any)[type]?.label ?? type}
    </div>
  )
}

/* ─── Section Editors ─── */

function SectionEditor({ section, onChange }: { section: Section; onChange: (d: Record<string, any>) => void }) {
  const { type, data } = section

  if (type === 'hero') return (
    <div className="space-y-3">
      <Field label="Headline" value={data.headline} onChange={v => onChange({ headline: v })} placeholder="Your dream home awaits" />
      <Field label="Subheadline" value={data.subheadline} onChange={v => onChange({ subheadline: v })} placeholder="Welcome to our newest project" />
      <Field label="CTA Button Text" value={data.cta_text} onChange={v => onChange({ cta_text: v })} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Background Style</label>
        <div className="flex flex-wrap gap-2">
          {['gradient_dark', 'gradient_blue', 'gradient_gold', 'solid_dark'].map(style => (
            <button key={style} type="button" onClick={() => onChange({ bg_style: style })}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                data.bg_style === style
                  ? 'bg-[rgba(201,169,110,0.12)] text-[var(--color-accent)] ring-1 ring-[rgba(201,169,110,0.3)]'
                  : 'bg-white/[0.04] text-[var(--text-tertiary)] hover:bg-white/[0.08]'
              }`}>
              {style.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (type === 'stats') return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Stats (up to 4)</p>
      {(data.items as { label: string; value: string }[]).map((item, i) => (
        <div key={i} className="flex gap-2">
          <input value={item.value} onChange={e => {
            const items = [...data.items]; items[i] = { ...items[i], value: e.target.value }; onChange({ items })
          }} placeholder="96" className="dashboard-input w-24 px-3 py-2 text-xs" />
          <input value={item.label} onChange={e => {
            const items = [...data.items]; items[i] = { ...items[i], label: e.target.value }; onChange({ items })
          }} placeholder="Total Units" className="dashboard-input flex-1 px-3 py-2 text-xs" />
          <button type="button" onClick={() => {
            const items = data.items.filter((_: any, j: number) => j !== i); onChange({ items })
          }} className="rounded-lg p-2 text-[var(--text-tertiary)] hover:bg-[rgba(244,63,94,0.08)] hover:text-[var(--color-rose,#f43f5e)]">
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
      {data.items.length < 4 && (
        <button type="button" onClick={() => onChange({ items: [...data.items, { label: '', value: '' }] })}
          className="flex items-center gap-1 text-xs text-[var(--color-accent)]">
          <Plus className="size-3" /> Add stat
        </button>
      )}
    </div>
  )

  if (type === 'gallery') return (
    <div className="space-y-3">
      <Field label="Section Title" value={data.title} onChange={v => onChange({ title: v })} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
          Image URLs (one per line)
        </label>
        <textarea
          value={(data.image_urls as string[]).join('\n')}
          onChange={e => onChange({ image_urls: e.target.value.split('\n').filter(Boolean) })}
          rows={4} className="dashboard-textarea w-full resize-none px-3 py-2 font-mono text-xs"
          placeholder="https://..." />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Layout</label>
        <div className="flex gap-2">
          {['grid', 'masonry', 'slider'].map(l => (
            <button key={l} type="button" onClick={() => onChange({ layout: l })}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                data.layout === l
                  ? 'bg-[rgba(201,169,110,0.12)] text-[var(--color-accent)] ring-1 ring-[rgba(201,169,110,0.3)]'
                  : 'bg-white/[0.04] text-[var(--text-tertiary)] hover:bg-white/[0.08]'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (type === 'video') return (
    <div className="space-y-3">
      <Field label="Section Title" value={data.title} onChange={v => onChange({ title: v })} />
      <Field label="YouTube / Embed URL" value={data.video_url} onChange={v => onChange({ video_url: v })} placeholder="https://youtube.com/embed/..." />
      <Field label="Caption" value={data.caption} onChange={v => onChange({ caption: v })} placeholder="Walkthrough of the project" />
    </div>
  )

  if (type === 'features') return (
    <div className="space-y-3">
      <Field label="Section Title" value={data.title} onChange={v => onChange({ title: v })} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
          Features (one per line)
        </label>
        <textarea
          value={(data.items as string[]).join('\n')}
          onChange={e => onChange({ items: e.target.value.split('\n').filter(Boolean) })}
          rows={5} className="dashboard-textarea w-full resize-none px-3 py-2 text-xs"
          placeholder="24/7 Security&#10;Generator Backup&#10;Swimming Pool&#10;Underground Parking" />
      </div>
    </div>
  )

  if (type === 'floor_plan') return (
    <div className="space-y-3">
      <Field label="Section Title" value={data.title} onChange={v => onChange({ title: v })} />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Plans</p>
      {(data.plans as any[]).map((plan: any, i: number) => (
        <div key={i} className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex gap-2">
            <input value={plan.name} onChange={e => {
              const plans = [...data.plans]; plans[i] = { ...plans[i], name: e.target.value }; onChange({ plans })
            }} placeholder="Type A — 3 BHK" className="dashboard-input flex-1 px-3 py-1.5 text-xs" />
            <button type="button" onClick={() => onChange({ plans: data.plans.filter((_: any, j: number) => j !== i) })}
              className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-rose,#f43f5e)]">
              <Trash2 className="size-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={plan.size} onChange={e => {
              const plans = [...data.plans]; plans[i] = { ...plans[i], size: e.target.value }; onChange({ plans })
            }} placeholder="1,450 sqft" className="dashboard-input px-3 py-1.5 text-xs" />
            <input value={plan.price} onChange={e => {
              const plans = [...data.plans]; plans[i] = { ...plans[i], price: e.target.value }; onChange({ plans })
            }} placeholder="৳ 85 Lac" className="dashboard-input px-3 py-1.5 text-xs" />
          </div>
          <input value={plan.image_url} onChange={e => {
            const plans = [...data.plans]; plans[i] = { ...plans[i], image_url: e.target.value }; onChange({ plans })
          }} placeholder="Floor plan image URL" className="dashboard-input w-full px-3 py-1.5 text-xs" />
        </div>
      ))}
      <button type="button" onClick={() => onChange({ plans: [...data.plans, { name: '', size: '', price: '', image_url: '' }] })}
        className="flex items-center gap-1 text-xs text-[var(--color-accent)]">
        <Plus className="size-3" /> Add plan
      </button>
    </div>
  )

  if (type === 'pricing') return (
    <div className="space-y-3">
      <Field label="Section Title" value={data.title} onChange={v => onChange({ title: v })} />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Units</p>
      {(data.units as any[]).map((unit: any, i: number) => (
        <div key={i} className="flex gap-2">
          <input value={unit.type} onChange={e => {
            const units = [...data.units]; units[i] = { ...units[i], type: e.target.value }; onChange({ units })
          }} placeholder="3 BHK" className="dashboard-input w-20 px-2 py-1.5 text-xs" />
          <input value={unit.size} onChange={e => {
            const units = [...data.units]; units[i] = { ...units[i], size: e.target.value }; onChange({ units })
          }} placeholder="1,450 sqft" className="dashboard-input w-24 px-2 py-1.5 text-xs" />
          <input value={unit.price} onChange={e => {
            const units = [...data.units]; units[i] = { ...units[i], price: e.target.value }; onChange({ units })
          }} placeholder="৳ 85,00,000" className="dashboard-input flex-1 px-2 py-1.5 text-xs" />
          <select value={unit.status} onChange={e => {
            const units = [...data.units]; units[i] = { ...units[i], status: e.target.value }; onChange({ units })
          }} className="dashboard-select w-24 px-2 py-1.5 text-xs">
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Sold">Sold</option>
          </select>
          <button type="button" onClick={() => onChange({ units: data.units.filter((_: any, j: number) => j !== i) })}
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-rose,#f43f5e)]">
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange({ units: [...data.units, { type: '', size: '', price: '', status: 'Available' }] })}
        className="flex items-center gap-1 text-xs text-[var(--color-accent)]">
        <Plus className="size-3" /> Add unit
      </button>
    </div>
  )

  if (type === 'testimonials') return (
    <div className="space-y-3">
      <Field label="Section Title" value={data.title} onChange={v => onChange({ title: v })} />
      {(data.items as any[]).map((item: any, i: number) => (
        <div key={i} className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex gap-2">
            <input value={item.name} onChange={e => {
              const items = [...data.items]; items[i] = { ...items[i], name: e.target.value }; onChange({ items })
            }} placeholder="Buyer name" className="dashboard-input flex-1 px-3 py-1.5 text-xs" />
            <select value={item.rating} onChange={e => {
              const items = [...data.items]; items[i] = { ...items[i], rating: Number(e.target.value) }; onChange({ items })
            }} className="dashboard-select w-16 px-2 py-1.5 text-xs">
              {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} ★</option>)}
            </select>
            <button type="button" onClick={() => onChange({ items: data.items.filter((_: any, j: number) => j !== i) })}
              className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-rose,#f43f5e)]">
              <Trash2 className="size-3" />
            </button>
          </div>
          <textarea value={item.quote} onChange={e => {
            const items = [...data.items]; items[i] = { ...items[i], quote: e.target.value }; onChange({ items })
          }} placeholder="Their testimonial…" rows={2} className="dashboard-textarea w-full resize-none px-3 py-2 text-xs" />
        </div>
      ))}
      <button type="button" onClick={() => onChange({ items: [...data.items, { name: '', quote: '', rating: 5 }] })}
        className="flex items-center gap-1 text-xs text-[var(--color-accent)]">
        <Plus className="size-3" /> Add testimonial
      </button>
    </div>
  )

  if (type === 'faq') return (
    <div className="space-y-3">
      <Field label="Section Title" value={data.title} onChange={v => onChange({ title: v })} />
      {(data.items as any[]).map((item: any, i: number) => (
        <div key={i} className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex gap-2">
            <input value={item.question} onChange={e => {
              const items = [...data.items]; items[i] = { ...items[i], question: e.target.value }; onChange({ items })
            }} placeholder="Question" className="dashboard-input flex-1 px-3 py-1.5 text-xs" />
            <button type="button" onClick={() => onChange({ items: data.items.filter((_: any, j: number) => j !== i) })}
              className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-rose,#f43f5e)]">
              <Trash2 className="size-3" />
            </button>
          </div>
          <textarea value={item.answer} onChange={e => {
            const items = [...data.items]; items[i] = { ...items[i], answer: e.target.value }; onChange({ items })
          }} placeholder="Answer" rows={2} className="dashboard-textarea w-full resize-none px-3 py-2 text-xs" />
        </div>
      ))}
      <button type="button" onClick={() => onChange({ items: [...data.items, { question: '', answer: '' }] })}
        className="flex items-center gap-1 text-xs text-[var(--color-accent)]">
        <Plus className="size-3" /> Add FAQ
      </button>
    </div>
  )

  if (type === 'location') return (
    <div className="space-y-3">
      <Field label="Section Title" value={data.title} onChange={v => onChange({ title: v })} />
      <Field label="Full Address" value={data.address} onChange={v => onChange({ address: v })} placeholder="House 12, Road 5, Dhanmondi, Dhaka" />
      <Field label="Google Maps Embed URL" value={data.map_embed} onChange={v => onChange({ map_embed: v })} placeholder="https://maps.google.com/..." />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
          Nearby Highlights (one per line)
        </label>
        <textarea
          value={(data.highlights as string[]).join('\n')}
          onChange={e => onChange({ highlights: e.target.value.split('\n').filter(Boolean) })}
          rows={4} className="dashboard-textarea w-full resize-none px-3 py-2 text-xs"
          placeholder="5 min — Gulshan 2&#10;10 min — Airport" />
      </div>
    </div>
  )

  if (type === 'cta') return (
    <div className="space-y-3">
      <Field label="Headline" value={data.headline} onChange={v => onChange({ headline: v })} placeholder="Ready to Book?" />
      <Field label="Subheadline" value={data.subheadline} onChange={v => onChange({ subheadline: v })} />
      <Field label="CTA Button Text" value={data.cta_text} onChange={v => onChange({ cta_text: v })} />
      <Field label="Phone (for WhatsApp CTA)" value={data.phone} onChange={v => onChange({ phone: v })} placeholder="01XXXXXXXXX" />
    </div>
  )

  if (type === 'contact') return (
    <div className="space-y-3">
      <Field label="Section Title" value={data.title} onChange={v => onChange({ title: v })} />
      <Field label="Phone" value={data.phone} onChange={v => onChange({ phone: v })} placeholder="01XXXXXXXXX" />
      <Field label="Email" value={data.email} onChange={v => onChange({ email: v })} placeholder="info@example.com" />
      <Field label="WhatsApp Number" value={data.whatsapp} onChange={v => onChange({ whatsapp: v })} />
    </div>
  )

  return null
}

/* ─── Shared Field ─── */

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="dashboard-input w-full px-3 py-2 text-xs" placeholder={placeholder} />
    </div>
  )
}
