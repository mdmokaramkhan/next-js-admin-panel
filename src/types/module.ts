export type Module = {
  id: number
  name: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
  parsings: {
    id: number
    status: string
    provider_code: string
    parsing: string
    allowed_amounts: string
  }[]
}
