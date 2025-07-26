import { z } from 'zod'

const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
]

export const patientSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().min(1),
  middle_name: z.string().optional(),
  last_name: z.string().min(1),
  date_of_birth: z
    .string()
    .min(1, { message: 'Required' })
    .refine((val) => {
      const date = new Date(val)
      const now = new Date()
      return !isNaN(date.getTime()) && date < now
    }, { message: 'Must be a valid date in the past' }),
  status: z.enum(['Inquiry', 'Onboarding', 'Active', 'Churned']),
  street_address: z.string().min(1),
  city: z.string().min(1),
  state: z.enum(usStates as [string, ...string[]], { message: 'Required' }),
  zip_code: z.string().regex(/^\d{5}$/, { message: 'Must be a 5-digit ZIP code' }),
  notes: z.string().optional(),
  created_at: z.string().optional(),
})

export type Patient = z.infer<typeof patientSchema>