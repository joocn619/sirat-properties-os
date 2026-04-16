import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xktepsztdgyhlkhymymh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrdGVwc3p0ZGd5aGxraHlteW1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg1OTI2MCwiZXhwIjoyMDkwNDM1MjYwfQ.tcueLYz9VIHmtLVwuaXAkD5fw1qFwgiXtrGWe06UmoU'
)

const buckets = [
  { name: 'avatars',          public: true  },
  { name: 'property-images',  public: true  },
  { name: 'project-updates',  public: true  },
  { name: 'kyc-docs',         public: false },
  { name: 'receipts',         public: false },
]

for (const bucket of buckets) {
  const { error } = await supabase.storage.createBucket(bucket.name, {
    public: bucket.public,
  })
  if (error && error.message.includes('already exists')) {
    console.log(`⚠️  ${bucket.name} — already exists, skipping`)
  } else if (error) {
    console.error(`❌ ${bucket.name} — ${error.message}`)
  } else {
    console.log(`✅ ${bucket.name} — created (public: ${bucket.public})`)
  }
}
