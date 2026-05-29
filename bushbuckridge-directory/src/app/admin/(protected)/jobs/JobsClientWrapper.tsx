'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import JobEditSheet from './JobEditSheet'

export default function JobsClientWrapper() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <Button className="h-12 px-6 rounded-xl font-bold shadow-md" onClick={() => setAddOpen(true)}>
        <Plus className="h-4 w-4 mr-2" /> Add Job
      </Button>
      <JobEditSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}
