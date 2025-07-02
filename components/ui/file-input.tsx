"use client"

import type React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Fires after the user selects one or more files */
  onFilesSelected?: (files: File[]) => void
  /** Extra wrapper classes */
  className?: string
}

/**
 * Lightweight file-picker used by the import wizard.
 * Shadcn/ui doesn’t ship a file-input, so we add a minimal one here.
 */
export function FileInput({ onFilesSelected, className, multiple = false, accept, ...rest }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files ?? [])
    onFilesSelected?.(fileList)
  }

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-dashed border-gray-300 p-4", className)}>
      <input ref={inputRef} type="file" hidden multiple={multiple} accept={accept} onChange={handleChange} {...rest} />

      <Button type="button" variant="outline" onClick={handleClick}>
        📁 Kies bestanden
      </Button>

      <span className="text-sm text-gray-600 select-none">Sleep bestanden hierheen of klik om te bladeren</span>
    </div>
  )
}
