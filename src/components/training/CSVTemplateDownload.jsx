import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateCSVTemplate } from '@/utils/csvParser'

const CSVTemplateDownload = ({ variant = 'outline', size = 'sm', className = '' }) => {
  const handleDownload = () => {
    const template = generateCSVTemplate()
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'training-plan-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      Download Template
    </Button>
  )
}

export default CSVTemplateDownload
