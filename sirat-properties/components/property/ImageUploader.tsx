'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Star, Trash2, Video } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export interface UploadedImage {
  is_primary: boolean
  media_type: 'image' | 'video'
  preview: string
  url: string
}

interface Props {
  onChange: (images: UploadedImage[]) => void
  propertyId: string
}

export function ImageUploader({ propertyId, onChange }: Props) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) {
      return
    }

    setUploading(true)
    const newImages: UploadedImage[] = []

    for (const file of files) {
      const isVideo = file.type.startsWith('video/')
      const ext = file.name.split('.').pop()
      const path = `${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage.from('property-images').upload(path, file)

      if (error) {
        toast.error(`${file.name} upload failed`)
        continue
      }

      const { data } = supabase.storage.from('property-images').getPublicUrl(path)

      newImages.push({
        url: data.publicUrl,
        is_primary: images.length === 0 && newImages.length === 0,
        media_type: isVideo ? 'video' : 'image',
        preview: URL.createObjectURL(file),
      })
    }

    const updated = [...images, ...newImages]
    setImages(updated)
    onChange(updated)
    setUploading(false)

    if (newImages.length) {
      toast.success(`${newImages.length} media item${newImages.length > 1 ? 's' : ''} uploaded`)
    }

    event.target.value = ''
  }

  function setPrimary(index: number) {
    const updated = images.map((image, imageIndex) => ({
      ...image,
      is_primary: imageIndex === index,
    }))

    setImages(updated)
    onChange(updated)
    toast.success('Primary media updated')
  }

  function remove(index: number) {
    const updated = images.filter((_, imageIndex) => imageIndex !== index)

    if (updated.length && !updated.some((image) => image.is_primary)) {
      updated[0].is_primary = true
    }

    setImages(updated)
    onChange(updated)
    toast.success('Media removed')
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group w-full rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center transition hover:border-[rgba(201,169,110,0.26)] hover:bg-white/[0.05]"
      >
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-[var(--color-accent)] transition group-hover:scale-105">
          <ImagePlus className="size-6" />
        </div>
        <p className="mt-5 text-base font-semibold text-[var(--text-primary)]">
          {uploading ? 'Uploading your media vault...' : 'Upload photos and walkthrough videos'}
        </p>
        <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
          JPG, PNG, MP4, or WEBM. Choose one hero media item as the primary preview for listing cards.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
          <span className="dashboard-badge" data-tone="gold">{images.length} uploaded</span>
          <span>20MB max each</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm"
          className="hidden"
          onChange={handleFiles}
          disabled={uploading}
        />
      </button>

      {images.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <div key={`${image.url}-${index}`} className="group overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.03]">
              <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                {image.media_type === 'video' ? (
                  <video src={image.preview} className="h-full w-full object-cover" />
                ) : (
                  <img src={image.preview} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                )}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                  <span className="dashboard-badge" data-tone={image.is_primary ? 'gold' : 'blue'}>
                    {image.is_primary ? <Star className="size-3" /> : image.media_type === 'video' ? <Video className="size-3" /> : <ImagePlus className="size-3" />}
                    {image.is_primary ? 'Primary' : image.media_type}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                  {!image.is_primary ? (
                    <button
                      type="button"
                      onClick={() => setPrimary(index)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border border-[rgba(201,169,110,0.24)] bg-black/45 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)] transition hover:bg-black/60',
                      )}
                    >
                      <Star className="size-3" />
                      Make primary
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="ml-auto inline-flex items-center gap-2 rounded-full border border-[rgba(244,63,94,0.24)] bg-black/45 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-rose)] transition hover:bg-black/60"
                  >
                    <Trash2 className="size-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty rounded-[1.75rem] px-5 py-12 text-center">
          <p className="text-sm leading-7 text-[var(--text-secondary)]">
            Add at least one clean exterior or interior image so the listing feels complete in search and dashboard views.
          </p>
        </div>
      )}
    </div>
  )
}
