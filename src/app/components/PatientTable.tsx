'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'

const caseInsensitiveSort = (rowA: any, rowB: any, columnId: string) => {
  const a = rowA.getValue(columnId)?.toLowerCase() ?? ''
  const b = rowB.getValue(columnId)?.toLowerCase() ?? ''
  return a.localeCompare(b)
}

const columnHelper = createColumnHelper<any>()

const columns = [
  columnHelper.accessor('first_name', {
    header: 'First Name',
    sortingFn: caseInsensitiveSort,
  }),
  columnHelper.accessor('last_name', {
    header: 'Last Name',
    sortingFn: caseInsensitiveSort,
  }),
  columnHelper.accessor('street_address', {
    header: 'Street Address',
    sortingFn: caseInsensitiveSort,
  }),
  columnHelper.accessor('date_of_birth', {
    header: 'Age',
    cell: dob => {
      const birthDate = new Date(dob.getValue())
      const today = new Date()
      const ageInMs = today.getTime() - birthDate.getTime()
      const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25)
      return Math.floor(ageInYears) + ' yrs'
    }
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    sortingFn: caseInsensitiveSort,
  }),
  columnHelper.accessor('city', { 
    header: 'City',
    sortingFn: caseInsensitiveSort,
  }),
  columnHelper.accessor('zip_code', {
    header: 'ZIP Code',
    sortingFn: caseInsensitiveSort,
  }),
  columnHelper.accessor('state', {
    header: 'State',
    sortingFn: caseInsensitiveSort,
  }),
  columnHelper.accessor('notes', {
    header: 'Notes',
    sortingFn: caseInsensitiveSort,
  }),
  columnHelper.accessor('created_at', {
    header: 'Created',
    cell: info => {
      const full = info.getValue()
      const date = new Date(full).toISOString().split('T')[0]
      return <div title={full}>{date}</div>
    }
  }),
]

export default function PatientTable() {
  const [patients, setPatients] = useState<any[]>([])
  const [sorting, setSorting] = useState([{ id: 'created_at', desc: true }])
  const [filterField, setFilterField] = useState('all')
  const [operator, setOperator] = useState('contains')
  const [filterValue, setFilterValue] = useState('')

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('*')
    setPatients(data ?? [])
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // Filtering logic with memoization and short-circuiting
  const filterData = (patients: any[]) => {
    // If no filter value, skip computation
    if (!filterValue) return patients
    // If patients is empty, skip computation
    if (!patients || patients.length === 0) return patients
    const target = filterValue.toLowerCase()
    return patients.filter(p => {
      if (filterField === 'all') {
        // Skip 'date_of_birth' and 'id' fields in 'all' filtering
        return Object.entries(p).some(([key, val]) => {
          if (key === 'date_of_birth' || key === 'id') return false
          if (key === 'created_at') {
            const dateStr = new Date(val as string).toISOString().split('T')[0]
            return dateStr.includes(target)
          }
          return String(val ?? '').toLowerCase().includes(target)
        })
      }
      if (filterField === 'age') {
        // Only compute age if filterField is 'age'
        const birthDate = new Date(p.date_of_birth)
        const today = new Date()
        const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        const num = Number(filterValue)
        if (isNaN(num)) return false
        if (operator === '=') return age === num
        if (operator === '>=') return age >= num
        if (operator === '<=') return age <= num
        return false
      } else {
        const val = String(p[filterField] ?? '').toLowerCase()
        if (operator === 'contains') return val.includes(target)
        if (operator === 'equals') return val === target
      }
      return false
    })
  }

  // Memoize filtered patients to avoid unnecessary computation
  const filteredPatients = useMemo(
    () => filterData(patients),
    [patients, filterField, operator, filterValue]
  )

  const table = useReactTable({
    data: filteredPatients,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    // globalFilterFn could be added here if using built-in global filtering
  })

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Records</h2>
        <div className="flex items-center gap-4 mb-6">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filterField}
            onChange={e => {
              const field = e.target.value
              setFilterField(field)
              setOperator(field === 'age' ? '>=' : 'contains')
              setFilterValue('')
            }}
          >
            <option value="all">All Fields</option>
            <option value="first_name">First Name</option>
            <option value="last_name">Last Name</option>
            <option value="street_address">Street Address</option>
            <option value="city">City</option>
            <option value="state">State</option>
            <option value="status">Status</option>
            <option value="notes">Notes</option>
            <option value="age">Age</option>
          </select>

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={operator}
            onChange={e => setOperator(e.target.value)}
          >
            {filterField === 'age' ? (
              <>
                <option value="=">=</option>
                <option value=">=">&ge;</option>
                <option value="<=">&le;</option>
              </>
            ) : (
              <>
                <option value="contains">contains</option>
                <option value="equals">equals</option>
              </>
            )}
          </select>

          <input
            type={filterField === 'age' ? 'number' : 'text'}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Enter ${filterField === 'age' ? 'age' : 'value'}...`}
            value={filterValue}
            onChange={e => setFilterValue(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      style={{
                        width: header.id === 'notes' ? '200px' : 
                               header.id === 'street_address' ? '150px' :
                               header.id === 'first_name' || header.id === 'last_name' ? '120px' :
                               header.id === 'city' || header.id === 'state' ? '100px' :
                               header.id === 'zip_code' ? '80px' :
                               header.id === 'status' ? '100px' :
                               header.id === 'created_at' ? '100px' :
                               header.id === 'date_of_birth' ? '80px' : 'auto'
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? ''}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs break-words">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {filterValue ? 'No patients match your search criteria.' : 'No patients found.'}
          </div>
        )}
      </div>
    </>
  )
}