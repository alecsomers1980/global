'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteJob } from './actions'
import { toast } from 'sonner'
import JobEditSheet from './JobEditSheet'

export default function JobActionsMenu({ job }: { job: any }) {
  const [loading, setLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return
    setLoading(true)
    try {
      await deleteJob(job.id)
      toast.success('Job deleted')
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading} className="h-10 w-10 p-0 rounded-xl hover:bg-primary/5">
            <MoreHorizontal className="h-5 w-5 text-primary/60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-2xl border-primary/10 shadow-xl bg-white/90 backdrop-blur-xl">
          <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest text-primary/40 px-3 py-2">Actions</DropdownMenuLabel>
          <DropdownMenuItem className="rounded-xl mx-1 cursor-pointer font-bold focus:bg-primary/5" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-primary/5" />
          <DropdownMenuItem className="rounded-xl mx-1 cursor-pointer focus:bg-red-50 focus:text-red-700 text-red-600 font-bold" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <JobEditSheet open={editOpen} onClose={() => setEditOpen(false)} job={job} />
    </>
  )
}
