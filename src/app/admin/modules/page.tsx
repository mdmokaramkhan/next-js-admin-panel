"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModulesTable } from "./components/modules-table"
import { ParsingsTable } from "./components/parsings-table"
import { CreateModuleDialog } from "./components/create-module-dialog"
import { CreateParsingDialog } from "./components/create-parsing-dialog" // Fixed import { CreateParsingDialog } from "./components/CreateParsingDialog"

export default function ModulesPage() {
  const [showCreateModule, setShowCreateModule] = useState(false)
  const [showCreateParsing, setShowCreateParsing] = useState(false)

  return (
    <><div className="container mx-auto py-10"></div><div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">Modules Management</h1>
      <div className="space-x-4">
        <Button onClick={() => setShowCreateModule(true)}>Add Module</Button>
        <Button onClick={() => setShowCreateParsing(true)}>Add Parsing</Button>
      </div>
    </div><div className="space-y-8">
        <ModulesTable />
        <ParsingsTable />
      </div><CreateModuleDialog
        open={showCreateModule}
        onOpenChange={setShowCreateModule} /><CreateParsingDialog
        open={showCreateParsing}
        onOpenChange={setShowCreateParsing} /></>
    </div>
  )
}
