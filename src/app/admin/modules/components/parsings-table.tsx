"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EditParsingDialog } from "./edit-parsing-dialog"

type Parsing = {
  id: number
  module_id: number
  provider_code: string
  parsing: string
  status: boolean
  allowed_amounts: string
}

export function ParsingsTable() {
  const [parsings, setParsings] = useState<Parsing[]>([])
  const [editingParsing, setEditingParsing] = useState<Parsing | null>(null)

  const deleteParsing = async (id: number) => {
    // Implement delete logic
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Parsings</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Module ID</TableHead>
            <TableHead>Provider Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Allowed Amounts</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parsings.map((parsing) => (
            <TableRow key={parsing.id}>
              <TableCell>{parsing.module_id}</TableCell>
              <TableCell>{parsing.provider_code}</TableCell>
              <TableCell>{parsing.status ? "Active" : "Inactive"}</TableCell>
              <TableCell>{parsing.allowed_amounts}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  onClick={() => setEditingParsing(parsing)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => deleteParsing(parsing.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingParsing && (
        <EditParsingDialog
          parsing={editingParsing}
          open={Boolean(editingParsing)}
          onOpenChange={() => setEditingParsing(null)}
        />
      )}
    </div>
  )
}
