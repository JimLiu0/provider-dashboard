export type Patient = {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  date_of_birth: string
  status: 'Inquiry' | 'Onboarding' | 'Active' | 'Churned'
  street_address: string
  city: string
  state: string
  zip_code: string
  notes?: string
  created_at: string
}