'use client'

import { useEffect, useState } from 'react'
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
  columnHelper.accessor('date_of_birth', {
    header: 'DOB',
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

  useEffect(() => {
    const fetchPatients = async () => {
      const { data } = await supabase.from('patients').select('*')
      setPatients(data ?? [])
    }
    fetchPatients()
  }, [])

  const table = useReactTable({
    data: patients,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
  })

  return (
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
  )
}