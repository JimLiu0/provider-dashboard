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
      <div className="flex items-center gap-4 mt-4">
        <select
          className="border px-3 py-2 rounded"
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
          className="border px-3 py-2 rounded"
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
          className="border px-3 py-2 rounded flex-1"
          placeholder={`Enter ${filterField === 'age' ? 'age' : 'value'}...`}
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
        />
      </div>
      <table className="mt-6 w-full border">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="border px-4 py-2 bg-gray-100 cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted() as string] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="border px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}