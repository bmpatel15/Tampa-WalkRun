"use client"

import * as React from "react"
import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from 'xlsx'
import { useParticipantStore, type Participant } from "@/lib/store"

// Define the expected column mappings
const EXPECTED_COLUMNS = {
  firstName: ['First Name'],
  lastName: ['Last Name'],
  registrantId: ['Registrant Id'],
  registrationType: ['Registrant Type'],
  address: ['Address'],
  city: ['City'],
  state: ['State / Prov / Zip / Pin'], // map to state
  phone: ['Phone'],
  email: ['Email'],
  checkedIn: ['Checked In'],
  totalPaid: ['Total Paid'],
  shirts: ['Shirt Size'],
  // Individual shirt size columns
  shirtLG: ['LG'],
  shirtMD: ['MD'],
  shirtSM: ['SM'],
  shirtYMD: ['Y-MD'],
  shirtYXS: ['Y-XS'],
  shirtYSM: ['Y-SM'],
  shirtYLG: ['Y-LG'],
  shirtXL: ['XL'],
  shirtXXL: ['XXL'],
}

// Valid shirt sizes
const VALID_SHIRT_SIZES = ['LG', 'MD', 'SM', 'Y-MD', 'Y-XS', 'Y-SM', 'Y-LG', 'XL', 'XXL']

export default function UploadPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedData, setUploadedData] = useState<Participant[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})

  const addParticipants = useParticipantStore((state) => state.addParticipants)
  const fetchParticipants = useParticipantStore((state) => state.fetchParticipants)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const findColumnMapping = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {}
    
    headers.forEach(header => {
      // Skip empty or undefined headers
      if (!header) return
      
      const normalizedHeader = String(header).trim().toLowerCase()
      
      // Check each expected column type
      Object.entries(EXPECTED_COLUMNS).forEach(([key, possibleNames]) => {
        if (possibleNames.some(name => name.toLowerCase() === normalizedHeader)) {
          mapping[key] = header
        }
      })
    })
    
    return mapping
  }

  const getShirtSizeFromColumns = (row: unknown[], headers: string[], mapping: Record<string, string>): string => {
    // Check each shirt size column
    for (const size of VALID_SHIRT_SIZES) {
      const columnKey = `shirt${size.replace('-', '')}`
      if (mapping[columnKey]) {
        const index = headers.indexOf(mapping[columnKey])
        if (index !== -1) {
          const value = (row as unknown[])[index]
          // Check if the value is 1 or true
          if (value === 1 || value === '1' || value === true || value === 'true') {
            return size
          }
        }
      }
    }
    return 'MD' // Default size if no match found
  }

  const validateShirtSize = (size: string): string => {
    const normalizedSize = size.trim().toUpperCase()
    if (VALID_SHIRT_SIZES.includes(normalizedSize)) {
      return normalizedSize
    }
    return 'MD' // Default size if invalid
  }

  const validateCheckedIn = (value: unknown): boolean => {
    if (typeof value === 'boolean') return value
    if (value === null || value === undefined) return false
    const normalizedValue = String(value).trim().toLowerCase()
    return normalizedValue === 'yes' || normalizedValue === 'true' || normalizedValue === '1'
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadStatus("uploading")
    setUploadProgress(0)
    setErrorMessage("")

    try {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })
          
          if (jsonData.length < 2) {
            throw new Error("The spreadsheet must contain at least a header row and one data row")
          }

          const headers = jsonData[0] as string[]
          const mapping = findColumnMapping(headers)
          
          if (Object.keys(mapping).length === 0) {
            throw new Error("No matching columns found in the spreadsheet. Please check the header names.")
          }

          setColumnMapping(mapping)

          // Process the data rows
          const processedData = jsonData.slice(1).map((row: unknown, idx: number) => {
            const rowArr = row as unknown[]
            const processedRow: Record<string, unknown> = {}
            Object.entries(mapping).forEach(([key, header]) => {
              const index = headers.indexOf(header)
              if (index !== -1) {
                let value = rowArr[index] ?? ''
                if (key === 'registrantId' || key === 'phone') {
                  value = String(value)
                } else if (key === 'registrationType') {
                  value = value ? String(value) : ''
                } else if (key === 'checkedIn') {
                  value = String(value).trim().toLowerCase() === 'yes'
                } else if (key === 'totalPaid') {
                  value = Number(value) || 0
                } else if (key === 'attendees' || key === 'additionalFamily') {
                  value = Number(value) || 0
                } else if (key === 'shirts') {
                  value = value || getShirtSizeFromColumns(rowArr, headers, mapping)
                }
                processedRow[key] = value
              }
            })
            processedRow['attendees'] = processedRow['attendees'] ?? 1
            processedRow['additionalFamily'] = processedRow['additionalFamily'] ?? 0
            return processedRow as unknown as Participant
          })

          setUploadProgress(100)
          setUploadedData(processedData as Participant[])
          setUploadStatus("success")

          toast({
            title: "Upload Successful!",
            description: `Successfully imported ${processedData.length} participants from the spreadsheet.`,
          })
        } catch (err) {
          setUploadStatus("error")
          setErrorMessage(err instanceof Error ? err.message : "Failed to process the spreadsheet")
        }
      }

      reader.onerror = () => {
        setUploadStatus("error")
        setErrorMessage("Failed to read the file")
      }

      reader.readAsArrayBuffer(file)
    } catch (err) {
      setUploadStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "Failed to process the file")
    }
  }

  const handleSaveParticipants = async () => {
    // Deduplicate by registrantId + firstName + lastName + email + registrationType
    const seen = new Set();
    const deduped = uploadedData.filter((p) => {
      const key = `${p.registrantId}|${p.firstName}|${p.lastName}|${p.email}|${p.registrationType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    try {
      await addParticipants(deduped)
      await fetchParticipants()
      toast({
        title: "Participants Saved!",
        description: "The participants have been saved and are now available for check-in.",
      })
      setUploadedData([])
      setUploadStatus("idle")
    } catch (err) {
      toast({
        title: "Error Saving Participants",
        description: err instanceof Error ? err.message : "Failed to save participants.",
        variant: "destructive",
      })
    }
  }

  const downloadTemplate = () => {
    // Create a template workbook
    const wb = XLSX.utils.book_new()
    const headers = Object.values(EXPECTED_COLUMNS).map(names => names[0])
    const ws = XLSX.utils.aoa_to_sheet([headers])
    XLSX.utils.book_append_sheet(wb, ws, "Template")
    
    // Generate and download the template
    XLSX.writeFile(wb, "registration_template.xlsx")
    
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded to your computer.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Upload Participant Data</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Spreadsheet Upload Instructions
              </CardTitle>
              <CardDescription>Follow these steps to successfully import participant data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Required Columns:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {Object.entries(EXPECTED_COLUMNS).map(([key, names]) => (
                      <li key={key}>• {names[0]}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">File Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Any spreadsheet format (.xlsx, .xls, .csv)</li>
                    <li>• First row should contain headers</li>
                    <li>• Maximum 1000 participants per file</li>
                    <li>• File size limit: 10MB</li>
                  </ul>
                </div>
              </div>
              <Button onClick={downloadTemplate} variant="outline" className="w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Download Excel Template
              </Button>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Spreadsheet</CardTitle>
              <CardDescription>Select your spreadsheet containing participant information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upload Button */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={handleFileSelect}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Click to upload spreadsheet</h3>
                  <p className="text-gray-600">or drag and drop your file here</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Upload Progress */}
                {uploadStatus === "uploading" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing file...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Error Message */}
                {uploadStatus === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Success Message */}
                {uploadStatus === "success" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Successfully imported {uploadedData.length} participants!</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Data */}
          {uploadedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview Imported Data</CardTitle>
                <CardDescription>Review the imported participant information before saving</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.entries(columnMapping).map(([key, header]) => (
                          <th key={key} className="text-left p-2">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedData.map((participant, idx) => (
                        <tr key={idx} className="border-b">
                          {Object.keys(columnMapping).map((key) => (
                            <td key={key} className="p-2">
                              {participant[key as keyof Participant] ?? ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex gap-4">
                  <Button className="flex-1" onClick={handleSaveParticipants}>Save All Participants</Button>
                  <Button variant="outline" onClick={() => setUploadedData([])}>
                    Clear Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Always show this button */}
          <div className="mt-6 flex">
            <Button
              variant="destructive"
              onClick={() => {
                useParticipantStore.getState().clearParticipants();
                toast({
                  title: "All participants cleared!",
                  description: "You can now re-upload your data file.",
                });
              }}
            >
              Clear All Participants
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
