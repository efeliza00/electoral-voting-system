"use client"
import { DialogDescription } from "@radix-ui/react-dialog"
import { VariantProps } from "class-variance-authority"
import { Bell, LoaderCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

const SendEmail = ({ disabled , variant, electionName ,isOngoing , handleConfirm }: {isOngoing:boolean; handleConfirm: () => void; electionName?:string; disabled?: boolean; variant?: VariantProps<typeof Button>['variant'];}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirmAndClose = () => {
    handleConfirm();
    setIsOpen(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger disabled={disabled} asChild><Button variant={variant} disabled={disabled}><Bell /> Notify Voters</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex gap-2 items-center"><div className=" rounded-full bg-green-200 p-2"><Bell className="text-green-600"/> </div><span>Notify Voters via Email?</span></DialogTitle>
        <DialogDescription>You are trying to send voter information to the voters of an election(<span className="capitalize font-semibold">{electionName}</span>). To confirm click <span className="font-semibold">Yes</span>.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" disabled={isOngoing} onClick={handleConfirmAndClose}>{isOngoing && <LoaderCircle className="animate-spin"/>}Yes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  
  )
}

export default SendEmail 