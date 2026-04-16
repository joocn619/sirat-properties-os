'use client'

import { useMemo, useState } from 'react'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  ImagePlus,
  Layers3,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'

import { ImageUploader, type UploadedImage } from './ImageUploader'
import { UnitManager, type Unit } from './UnitManager'

const PROPERTY_TYPES = [
  { value: 'flat', label: 'Flat / Apartment' },
  { value: 'land_share', label: 'Land Share' },
  { value: 'commercial', label: 'Commercial Space' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'plot', label: 'Plot' },
]

const LISTING_TYPES = [
  { value: 'sale', label: 'বিক্রয়' },
  { value: 'rent', label: 'ভাড়া' },
  { value: 'installment', label: 'কিস্তিতে বিক্রয়' },
]

const DISTRICTS = [
  'ঢাকা',
  'চট্টগ্রাম',
  'সিলেট',
  'রাজশাহী',
  'খুলনা',
  'বরিশাল',
  'ময়মনসিংহ',
  'রংপুর',
  'গাজীপুর',
  'নারায়ণগঞ্জ',
]

const AMENITIES = [
  'Lift',
  'Generator',
  'Parking',
  'Security',
  'CCTV',
  'Gym',
  'Swimming Pool',
  'Rooftop',
  'Gas Line',
  'Broadband',
]

const STEPS = [
  {
    id: 'basics',
    label: 'Basics',
    description: 'Title, offer type, pricing',
    icon: Building2,
  },
  {
    id: 'location',
    label: 'Location',
    description: 'Area and address',
    icon: MapPin,
  },
  {
    id: 'details',
    label: 'Details',
    description: 'Floors and amenities',
    icon: Layers3,
  },
  {
    id: 'media',
    label: 'Media',
    description: 'Photos, videos, units',
    icon: ImagePlus,
  },
  {
    id: 'publish',
    label: 'Review',
    description: 'Final checks and publish',
    icon: FileCheck2,
  },
] as const

function stepGuard(step: number, title: string) {
  if (step === 0 && !title.trim()) {
    return 'Property title দিন'
  }

  return null
}

export function PropertyForm({ userId, isVerified }: { isVerified: boolean; userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    property_type: 'flat',
    listing_type: 'sale',
    price: '',
    area_sqft: '',
    location: '',
    district: 'ঢাকা',
    address: '',
    floor_number: '',
    total_floors: '',
    facing: '',
    amenities: [] as string[],
  })

  const readiness = useMemo(() => {
    const checkpoints = [
      Boolean(form.title.trim()),
      Boolean(form.location.trim() || form.address.trim()),
      Boolean(form.description.trim() || form.area_sqft || form.price),
      Boolean(images.length || units.length),
      isVerified,
    ]

    const done = checkpoints.filter(Boolean).length
    return {
      count: done,
      percent: Math.round((done / checkpoints.length) * 100),
    }
  }, [form.address, form.area_sqft, form.description, form.location, form.price, form.title, images.length, isVerified, units.length])

  function toggleAmenity(amenity: string) {
    setForm((previous) => ({
      ...previous,
      amenities: previous.amenities.includes(amenity)
        ? previous.amenities.filter((currentAmenity) => currentAmenity !== amenity)
        : [...previous.amenities, amenity],
    }))
  }

  function goNext() {
    const validationMessage = stepGuard(currentStep, form.title)
    if (validationMessage) {
      setError(validationMessage)
      toast.error(validationMessage)
      return
    }

    setError('')
    setCurrentStep((previous) => Math.min(previous + 1, STEPS.length - 1))
  }

  function goBack() {
    setError('')
    setCurrentStep((previous) => Math.max(previous - 1, 0))
  }

  async function handleSubmit(publish: boolean) {
    if (!form.title.trim()) {
      const message = 'Property title দিন'
      setError(message)
      toast.error(message)
      setCurrentStep(0)
      return
    }

    if (publish && !isVerified) {
      const message = 'KYC verify না হলে publish করা যাবে না'
      setError(message)
      toast.error(message)
      setCurrentStep(STEPS.length - 1)
      return
    }

    // Check subscription limit before publishing
    if (publish) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan_id, subscription_plans(max_listings)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const maxListings = (sub?.subscription_plans as any)?.max_listings ?? 3 // free plan default
      const { count } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('is_published', true)

      if ((count ?? 0) >= maxListings) {
        const message = `Your plan allows ${maxListings} published listings. Upgrade from Billing to publish more.`
        setError(message)
        toast.error(message)
        setCurrentStep(STEPS.length - 1)
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          seller_id: userId,
          title: form.title,
          description: form.description || null,
          property_type: form.property_type,
          listing_type: form.listing_type,
          price: form.price ? Number(form.price) : null,
          area_sqft: form.area_sqft ? Number(form.area_sqft) : null,
          location: form.location || null,
          district: form.district,
          address: form.address || null,
          floor_number: form.floor_number ? Number(form.floor_number) : null,
          total_floors: form.total_floors ? Number(form.total_floors) : null,
          facing: form.facing || null,
          amenities: form.amenities,
          is_published: publish,
          status: 'available',
        })
        .select()
        .single()

      if (propertyError || !property) {
        throw propertyError ?? new Error('Property create failed')
      }

      if (images.length > 0) {
        await supabase.from('property_images').insert(
          images.map((image) => ({
            property_id: property.id,
            is_primary: image.is_primary,
            media_type: image.media_type,
            url: image.url,
          })),
        )
      }

      if (units.length > 0) {
        await supabase.from('property_units').insert(
          units.map((unit) => ({
            property_id: property.id,
            unit_number: unit.unit_number,
            floor: unit.floor || null,
            area_sqft: unit.area_sqft || null,
            price: unit.price || null,
            status: 'available',
          })),
        )
      }

      toast.success(publish ? 'Property published successfully' : 'Draft saved successfully')
      router.push('/seller/listings')
    } catch {
      const message = 'Property save করতে সমস্যা হয়েছে'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const stepProgress = `${(currentStep / (STEPS.length - 1)) * 100}%`
  const activeStep = STEPS[currentStep]
  const ActiveIcon = activeStep.icon

  return (
    <div className="space-y-6">
      <section className="dashboard-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2">
              <ActiveIcon className="size-4 text-[var(--color-accent)]" />
              <p className="dashboard-label text-[var(--color-accent)]">{activeStep.label}</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-3xl">
                Build a polished listing, step by step
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
                Move through the workflow in order, review the summary, then save as draft or publish once KYC is approved.
              </p>
            </div>
          </div>

          <div className="min-w-[15rem] rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="dashboard-label">Readiness</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{readiness.percent}%</p>
              </div>
              <span className="dashboard-badge" data-tone={isVerified ? 'emerald' : 'gold'}>
                {isVerified ? 'KYC Verified' : 'Draft only'}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[linear-gradient(135deg,#C9A96E_0%,#E2C99A_50%,#A87B3F_100%)] transition-all duration-300"
                style={{ width: `${readiness.percent}%` }}
              />
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              {readiness.count} of 5 checkpoints complete
            </p>
          </div>
        </div>

        <div className="relative mt-8">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-white/[0.06] sm:block" />
          <div
            className="absolute left-0 top-5 hidden h-px bg-[linear-gradient(90deg,#C9A96E_0%,#E2C99A_50%,rgba(201,169,110,0.05)_100%)] transition-all duration-300 sm:block"
            style={{ width: stepProgress }}
          />
          <div className="grid gap-3 sm:grid-cols-5">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isComplete = index < currentStep

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`relative rounded-[1.5rem] border px-4 py-4 text-left transition ${
                    isActive
                      ? 'border-[rgba(201,169,110,0.26)] bg-[rgba(201,169,110,0.08)]'
                      : isComplete
                        ? 'border-[rgba(16,185,129,0.22)] bg-[rgba(16,185,129,0.08)]'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]'
                  }`}
                >
                  <span
                    className={`relative z-10 flex size-10 items-center justify-center rounded-2xl ${
                      isActive
                        ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
                        : isComplete
                          ? 'bg-[var(--color-emerald-glow)] text-[var(--color-emerald)]'
                          : 'bg-white/[0.03] text-[var(--text-secondary)]'
                    }`}
                  >
                    <StepIcon className="size-4" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{step.label}</p>
                  <p className="mt-1 text-xs leading-6 text-[var(--text-secondary)]">{step.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-[rgba(244,63,94,0.24)] bg-[rgba(244,63,94,0.08)] px-5 py-4 text-sm text-[var(--color-rose)]">
          {error}
        </div>
      ) : null}

      <section className="dashboard-panel rounded-[2rem] p-5 sm:p-7">
        {currentStep === 0 ? (
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Step 1"
              title="Define the listing story"
              description="Lead with a strong title, choose the offer structure, and add the key commercial details buyers will scan first."
            />

            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Property title" required>
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="e.g. Bashundhara R/A 3 bed luxury flat"
                  className="dashboard-input px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Property type">
                <select
                  value={form.property_type}
                  onChange={(event) => setForm({ ...form, property_type: event.target.value })}
                  className="dashboard-select px-4 py-3 text-sm"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Listing type">
                <select
                  value={form.listing_type}
                  onChange={(event) => setForm({ ...form, listing_type: event.target.value })}
                  className="dashboard-select px-4 py-3 text-sm"
                >
                  {LISTING_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Price (BDT)">
                <input
                  type="number"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  placeholder="e.g. 8500000"
                  className="dashboard-input px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Area (sqft)">
                <input
                  type="number"
                  value={form.area_sqft}
                  onChange={(event) => setForm({ ...form, area_sqft: event.target.value })}
                  placeholder="e.g. 1250"
                  className="dashboard-input px-4 py-3 text-sm"
                />
              </Field>

              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="dashboard-label">Preview price</p>
                <p className="mt-3 font-price text-2xl font-medium text-[var(--color-accent)]">
                  {formatCurrency(form.price ? Number(form.price) : null)}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  Leave pricing empty if you want the listing to show as negotiable.
                </p>
              </div>
            </div>

            <Field label="Description">
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Tell buyers what makes this property stand out..."
                className="dashboard-textarea resize-none px-4 py-3 text-sm"
              />
            </Field>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Step 2"
              title="Place the property on the map"
              description="Add area, district, and address details so dashboards, search, and agent conversations all stay grounded in the same location context."
            />

            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Area / neighborhood">
                <input
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  placeholder="e.g. Bashundhara R/A"
                  className="dashboard-input px-4 py-3 text-sm"
                />
              </Field>

              <Field label="District">
                <select
                  value={form.district}
                  onChange={(event) => setForm({ ...form, district: event.target.value })}
                  className="dashboard-select px-4 py-3 text-sm"
                >
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Full address">
              <input
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                placeholder="House no, road, block, nearby landmark..."
                className="dashboard-input px-4 py-3 text-sm"
              />
            </Field>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Step 3"
              title="Capture structure and amenities"
              description="Outline floor details and lifestyle features so your listing feels trustworthy, premium, and easy to compare."
            />

            <div className="grid gap-5 lg:grid-cols-3">
              <Field label="Floor no.">
                <input
                  type="number"
                  value={form.floor_number}
                  onChange={(event) => setForm({ ...form, floor_number: event.target.value })}
                  placeholder="e.g. 5"
                  className="dashboard-input px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Total floors">
                <input
                  type="number"
                  value={form.total_floors}
                  onChange={(event) => setForm({ ...form, total_floors: event.target.value })}
                  placeholder="e.g. 12"
                  className="dashboard-input px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Facing">
                <select
                  value={form.facing}
                  onChange={(event) => setForm({ ...form, facing: event.target.value })}
                  className="dashboard-select px-4 py-3 text-sm"
                >
                  <option value="">Select</option>
                  {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map((facing) => (
                    <option key={facing} value={facing}>
                      {facing}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="space-y-3">
              <p className="dashboard-label">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => {
                  const selected = form.amenities.includes(amenity)

                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        selected
                          ? 'border-[rgba(201,169,110,0.28)] bg-[rgba(201,169,110,0.1)] text-[var(--color-accent)]'
                          : 'border-white/10 bg-white/[0.03] text-[var(--text-secondary)] hover:border-white/16 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {amenity}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-8">
            <SectionIntro
              eyebrow="Step 4"
              title="Add media and unit inventory"
              description="Upload strong visuals, then set up optional unit-level inventory for towers, duplexes, or project-based listings."
            />

            <div className="space-y-3">
              <p className="dashboard-label">Photos / videos</p>
              <ImageUploader propertyId={`draft-${userId}`} onChange={setImages} />
            </div>

            <div className="space-y-3">
              <p className="dashboard-label">Units / flats</p>
              <UnitManager onChange={setUnits} />
            </div>
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Step 5"
              title="Review before launch"
              description="Take a final pass through the listing summary. Save as draft anytime, or publish instantly if KYC is already approved."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <SummaryCard
                label="Listing"
                title={form.title || 'Untitled listing'}
                description={`${PROPERTY_TYPES.find((type) => type.value === form.property_type)?.label ?? 'Property'} · ${LISTING_TYPES.find((type) => type.value === form.listing_type)?.label ?? 'Offer'}`}
              />
              <SummaryCard
                label="Location"
                title={[form.location, form.district].filter(Boolean).join(', ') || 'Location pending'}
                description={form.address || 'Full address not added yet'}
              />
              <SummaryCard
                label="Pricing"
                title={formatCurrency(form.price ? Number(form.price) : null)}
                description={form.area_sqft ? `${form.area_sqft} sqft` : 'Area pending'}
              />
              <SummaryCard
                label="Media & units"
                title={`${images.length} media / ${units.length} units`}
                description={form.amenities.length ? `${form.amenities.length} amenities selected` : 'Amenities optional'}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="dashboard-label">Description</p>
                <p className="mt-4 text-sm leading-8 text-[var(--text-secondary)]">
                  {form.description || 'No listing description added yet.'}
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex items-start gap-3">
                  <div className={`flex size-11 items-center justify-center rounded-2xl ${isVerified ? 'bg-[var(--color-emerald-glow)] text-[var(--color-emerald)]' : 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]'}`}>
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="space-y-2">
                    <p className="dashboard-label">KYC status</p>
                    <p className="text-base font-semibold text-[var(--text-primary)]">
                      {isVerified ? 'Verified and ready to publish' : 'Not verified yet'}
                    </p>
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">
                      {isVerified
                        ? 'You can publish immediately from this final step.'
                        : 'You can still save a full draft now and publish once KYC is approved.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <div className="dashboard-panel flex flex-col gap-4 rounded-[2rem] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="dashboard-label">Current step</p>
          <p className="text-base font-semibold text-[var(--text-primary)]">
            {currentStep + 1}. {activeStep.label}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">{activeStep.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="rounded-full border-white/10 bg-white/[0.03] px-5 text-[var(--text-primary)] hover:border-white/16 hover:bg-white/[0.05]"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
          ) : null}

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={goNext}
              className="rounded-full bg-[linear-gradient(135deg,#C9A96E_0%,#E2C99A_48%,#A87B3F_100%)] px-5 text-[var(--text-inverse)] shadow-[0_18px_45px_rgba(201,169,110,0.22)] hover:brightness-105"
            >
              Continue
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleSubmit(false)}
                className="rounded-full border-white/10 bg-white/[0.03] px-5 text-[var(--text-primary)] hover:border-white/16 hover:bg-white/[0.05]"
              >
                {loading ? 'Saving...' : 'Save draft'}
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit(true)}
                className="rounded-full bg-[linear-gradient(135deg,#C9A96E_0%,#E2C99A_48%,#A87B3F_100%)] px-5 text-[var(--text-inverse)] shadow-[0_18px_45px_rgba(201,169,110,0.22)] hover:brightness-105"
              >
                {loading ? 'Publishing...' : 'Publish listing'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode
  label: string
  required?: boolean
}) {
  return (
    <label className="space-y-2">
      <span className="dashboard-label">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <div className="space-y-2">
      <p className="dashboard-label text-[var(--color-accent)]">{eyebrow}</p>
      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">{title}</h3>
      <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
    </div>
  )
}

function SummaryCard({
  label,
  title,
  description,
}: {
  description: string
  label: string
  title: string
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
      <p className="dashboard-label">{label}</p>
      <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
    </div>
  )
}
