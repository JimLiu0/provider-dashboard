import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { patientSchema } from '../types/patient'
import { supabase } from '../lib/supabaseClient'
import { useRef } from 'react'
import toast from 'react-hot-toast'

type FormData = z.infer<typeof patientSchema>

export default function AddPatientModal({
  isOpen,
  onClose,
  onSuccess,
  refreshPatients,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void // callback to refresh table
  refreshPatients: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(patientSchema),
  })

  // Register first_name once for both props and ref
  const firstNameRegister = register('first_name')

  const inputRef = useRef<HTMLInputElement>(null)

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from('patients').insert(data)
    if (!error) {
      toast.success('Patient added!')
      onSuccess()
      refreshPatients()
      reset()
      onClose()
    } else {
      console.error(error)
    }
  }

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  if (!isOpen) return null

  // Keyboard shortcuts: Enter to submit, Escape to close
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose()
    }
    // Enter handled by native form submit
  }

  return (
    <div
      className="fixed inset-0 bg-gray bg-opacity-50 flex justify-center items-center z-50 p-4"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Add New Patient</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-6 gap-6">
            {/* Personal Info */}
            <div className="col-span-2 flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">First Name</label>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="First Name"
                {...firstNameRegister}
                ref={(e) => {
                  firstNameRegister.ref(e)
                  inputRef.current = e
                }}
              />
              {errors.first_name && <p className="text-red-500 text-sm mt-1">Required</p>}
            </div>
            <div className="col-span-2 flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Middle Name</label>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Middle Name"
                {...register('middle_name')}
              />
              {/* No validation message for middle_name since it's optional */}
            </div>
            <div className="col-span-2 flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Last Name</label>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Last Name"
                {...register('last_name')}
              />
              {errors.last_name && <p className="text-red-500 text-sm mt-1">Required</p>}
            </div>

            <div className="col-span-3 flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                {...register('date_of_birth')}
              />
              {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth.message}</p>}
            </div>
            <div className="col-span-3 flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Status</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                {...register('status')}
              >
                <option value="">Select Status</option>
                <option>Inquiry</option>
                <option>Onboarding</option>
                <option>Active</option>
                <option>Churned</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">Required</p>}
            </div>

            {/* Address */}
            <div className="col-span-6 flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Street Address</label>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Street Address"
                {...register('street_address')}
              />
              {errors.street_address && <p className="text-red-500 text-sm mt-1">Required</p>}
            </div>
            <div className="col-span-2 flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">City</label>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="City"
                {...register('city')}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">Required</p>}
            </div>
            <div className="col-span-2 flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">State</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                {...register('state')}
              >
                <option value="">Select State</option>
                <option value="Alabama">Alabama</option>
                <option value="Alaska">Alaska</option>
                <option value="Arizona">Arizona</option>
                <option value="Arkansas">Arkansas</option>
                <option value="California">California</option>
                <option value="Colorado">Colorado</option>
                <option value="Connecticut">Connecticut</option>
                <option value="Delaware">Delaware</option>
                <option value="Florida">Florida</option>
                <option value="Georgia">Georgia</option>
                <option value="Hawaii">Hawaii</option>
                <option value="Idaho">Idaho</option>
                <option value="Illinois">Illinois</option>
                <option value="Indiana">Indiana</option>
                <option value="Iowa">Iowa</option>
                <option value="Kansas">Kansas</option>
                <option value="Kentucky">Kentucky</option>
                <option value="Louisiana">Louisiana</option>
                <option value="Maine">Maine</option>
                <option value="Maryland">Maryland</option>
                <option value="Massachusetts">Massachusetts</option>
                <option value="Michigan">Michigan</option>
                <option value="Minnesota">Minnesota</option>
                <option value="Mississippi">Mississippi</option>
                <option value="Missouri">Missouri</option>
                <option value="Montana">Montana</option>
                <option value="Nebraska">Nebraska</option>
                <option value="Nevada">Nevada</option>
                <option value="New Hampshire">New Hampshire</option>
                <option value="New Jersey">New Jersey</option>
                <option value="New Mexico">New Mexico</option>
                <option value="New York">New York</option>
                <option value="North Carolina">North Carolina</option>
                <option value="North Dakota">North Dakota</option>
                <option value="Ohio">Ohio</option>
                <option value="Oklahoma">Oklahoma</option>
                <option value="Oregon">Oregon</option>
                <option value="Pennsylvania">Pennsylvania</option>
                <option value="Rhode Island">Rhode Island</option>
                <option value="South Carolina">South Carolina</option>
                <option value="South Dakota">South Dakota</option>
                <option value="Tennessee">Tennessee</option>
                <option value="Texas">Texas</option>
                <option value="Utah">Utah</option>
                <option value="Vermont">Vermont</option>
                <option value="Virginia">Virginia</option>
                <option value="Washington">Washington</option>
                <option value="West Virginia">West Virginia</option>
                <option value="Wisconsin">Wisconsin</option>
                <option value="Wyoming">Wyoming</option>
              </select>
              {errors.state && <p className="text-red-500 text-sm mt-1">Required</p>}
            </div>
            <div className="col-span-2 flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Zip Code</label>
              <input
                type="tel"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Zip Code"
                {...register('zip_code')}
              />
              {errors.zip_code && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.zip_code.message ?? 'Required'}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="col-span-6 row-span-3 flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Notes</label>
              <textarea
                placeholder="Notes"
                className="min-h-[80px] resize-y border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                {...register('notes')}
              />
              {errors.notes && <p className="text-red-500 text-sm mt-1">Required</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
              Add Patient
            </button>
            <button
              type="submit"
              onClick={async (e) => {
                e.preventDefault()
                const values = getValues()
                const result = patientSchema.safeParse(values)
                if (!result.success) return
                const { error } = await supabase.from('patients').insert(result.data)
                if (!error) {
                  toast.success('Patient added!')
                  onSuccess()
                  refreshPatients()
                  reset()
                } else {
                  console.error(error)
                }
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Add &amp; Keep Open
            </button>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}