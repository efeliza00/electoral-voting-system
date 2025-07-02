import { FileDown, FolderUp } from "lucide-react"
import FileUploaderSpreadSheet from "./file-uploader-spreadsheet"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

const AddVoters = ({ disabled }: { disabled?: boolean }) => {
  return (
    <Dialog>
      <DialogTrigger disabled={disabled} asChild><Button disabled={disabled}><FileDown /> Import Voters</Button></DialogTrigger>
    <DialogContent>
        <DialogHeader className="flex-row items-center">
          <div className="p-2 rounded-full bg-muted "><FolderUp className="text-secondary-foreground " /></div>
          <DialogTitle>Import Voters?</DialogTitle>
        </DialogHeader>
        <FileUploaderSpreadSheet />
    </DialogContent>
  </Dialog>
  
  )
}

export default AddVoters 