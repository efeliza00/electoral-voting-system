import { deleteAnElection } from "@/actions/election/delete-election"
import { ElectionListType } from "@/app/admin/dashboard/elections/lists/page"
import { LoaderCircle, Trash2 } from "lucide-react"
import { Types } from "mongoose"
import { useState, useTransition } from "react"
import toast from "react-hot-toast"
import { KeyedMutator } from "swr"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

const DeleteElectionModal = ({
    id,
    name,
  mutate,
  disabled,
}: {
    id: Types.ObjectId
    name: string
    mutate: KeyedMutator<ElectionListType>
    disabled?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [isOngoing, startTransition] = useTransition()
  const handleDeleteAnElection = async (id: Types.ObjectId) => {
        startTransition(async () => {
            const res = await deleteAnElection(id)
            if (res?.success) {
                toast.success(res?.message)
              setOpen(prevState => !prevState)
              mutate()
            }
            if (res?.error) {
                toast.error(res.error)
            }
        })
    }
    return (
      <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    size="sm"
            variant="default"
            disabled={disabled}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Trash2 />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[425px]"
          onClick={(e) => {
            e.stopPropagation()
            mutate()
          }}
            >
                <DialogHeader>
                    <DialogTitle>Delete an Election</DialogTitle>
                    <DialogDescription>
                        Are you sure u want to delete{" "}
                        <span className="text-xl font-medium text-primary">
                            {name}
                        </span>{" "}
                        as an election?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAnElection(id)
                        }}
              disabled={isOngoing}
                        variant="destructive"
                    >
              {isOngoing ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                `Yes, Delete this election.`
              )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteElectionModal
