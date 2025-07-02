  "use client"
import { addVoters } from '@/app/actions/voters/add-voters';
import { FileDown, LoaderCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet";
import * as XLSX from 'xlsx';
import { Button } from './ui/button';


  const FileUploaderSpreadSheet = () => {
    const pathname  = usePathname()
    const [spreadsheetDataPreview, setSpreadsheetDataPreview] = useState<Matrix<CellBase<string | number>>>([]);
    const [spreadsheetData , setSpreadsheetData ] = useState<string[][]>([])
    const [isOngoing, startTransition] = useTransition()

    const extractElectionId = () => {
      const parts = pathname.split('/');
      return parts[parts.length - 1]; 
    };

    const electionId = extractElectionId();
    
    
    const onDrop =  (acceptedFiles: File[]) => {
      startTransition(async () => {
        if (acceptedFiles.length === 0) return;
    
      const file = acceptedFiles[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      
      
      const jsonData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = jsonData[0].map(header => 
        String(header).toLowerCase().trim()
      );

      if (!headers.includes('id') || !headers.includes('name')) {
        setSpreadsheetDataPreview([])
        toast.error('Excel file must contain "id" and "name" columns');
        return
      }

      
        if (headers.length > 4) {
        setSpreadsheetDataPreview([])
          toast.error('Excel file should not exceed 4 columns');
        return
      }
      
      const formattedData = jsonData.map((row: unknown[]) => 
        (row as Array<string | number | boolean | null | undefined>).map(cell => ({ 
          value: cell !== null && cell !== undefined ? String(cell) : '' ,
          readOnly:true
        }))
      );

      const formattedJsonSpreadSheetData = jsonData.slice(1).map(row =>
        row.map(cell => (cell !== null && cell !== undefined ? String(cell) : ''))
      )
      setSpreadsheetDataPreview(formattedData);
      setSpreadsheetData(formattedJsonSpreadSheetData)

      })
    }

    const handleAddVoters =  () => { 
      startTransition(async () =>{
        const res = await addVoters({voters:spreadsheetData , id: electionId })
        if(res?.success){
          setSpreadsheetDataPreview([]);
      setSpreadsheetData([])
          toast.success(res?.success)
        }else{
          toast.error(res?.error as string)
        }
      })
    }


    const { getRootProps, getInputProps , acceptedFiles, isDragReject} = useDropzone({
      onDrop,
      accept: {
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
      },
      maxFiles: 1
    });

    if (isOngoing)
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-secondary">
              <LoaderCircle className="animate-spin size-10" />
          <p className='text-muted-foreground tracking-tight'>Importing Voters...</p>
          </div>
      )

    return (
      <section className="container overflow-auto ">
        <div {...getRootProps({ 
          className: `dropzone ${isDragReject && "border-destructive"} ${spreadsheetDataPreview.length > 0 && "border-green-500"} rounded-xl min-h-40 max-h-full flex flex-col items-center justify-center border-2 border-dashed p-2 cursor-pointer hover:bg-accent/50` 
        })}>
          <input {...getInputProps()} />
          <p className='text-muted-foreground tracking-tight'>
            Drag n drop an Excel file here, or click the box 
          </p>
          <em className='text-muted-foreground text-sm'>
            (Only *.xls and *.xlsx files will be accepted)
          </em>
        </div>
        
        <aside className="mt-4 overflow-auto max-h-32 space-y-4">
          {acceptedFiles.length > 0 && <>{acceptedFiles.map((file,index) => (<div key={index} className='bg-secondary p-2 '>{file.name}</div>))}</>}
          {spreadsheetDataPreview.length > 0 && (
            <Spreadsheet  hideColumnIndicators hideRowIndicators data={spreadsheetDataPreview} className='w-40 rounded-xl'/>
          )}
        </aside>
        <Button type="button" className='w-full' onClick={handleAddVoters} disabled={spreadsheetDataPreview.length === 0 || isOngoing}><FileDown /> Add Voters</Button>
      </section>
    );
  };

  export default FileUploaderSpreadSheet;