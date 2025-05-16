import { FileDown } from "lucide-react"
import FileUploaderSpreadSheet from "./file-uploader-spreadsheet"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

const AddVoters = () => {
  return (
    <Dialog>
    <DialogTrigger asChild><Button><FileDown /> Import Voters</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Import Voters?</DialogTitle>
        <FileUploaderSpreadSheet/>
      </DialogHeader>
    </DialogContent>
  </Dialog>
  
  )
}

export default AddVoters 