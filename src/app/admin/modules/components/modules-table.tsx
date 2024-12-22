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
import { EditModuleDialog } from "./edit-module-dialog"

type Module = {
  id: number
  module_name: string
  response_group: string
  username: string
  method: string
  balance: number
  recharge_url: string
  balance_url: string
}

export function ModulesTable() {
  const [modules, setModules] = useState<Module[]>([])
  const [editingModule, setEditingModule] = useState<Module | null>(null)

  const deleteModule = async (id: number) => {
    // Implement delete logic
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Modules</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Module Name</TableHead>
            <TableHead>Response Group</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => (
            <TableRow key={module.id}>
              <TableCell>{module.module_name}</TableCell>
              <TableCell>{module.response_group}</TableCell>
              <TableCell>{module.method}</TableCell>
              <TableCell>{module.balance}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  onClick={() => setEditingModule(module)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => deleteModule(module.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingModule && (
        <EditModuleDialog
          module={editingModule}
          open={Boolean(editingModule)}
          onOpenChange={() => setEditingModule(null)}
        />
      )}
    </div>
  )
}
