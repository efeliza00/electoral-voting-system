import { deleteAnElection } from "@/actions/election/delete-election"
import { LoaderCircle, Trash2 } from "lucide-react"
import { Types } from "mongoose"
import { useTransition } from "react"
import toast from "react-hot-toast"
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
}: {
    id: Types.ObjectId
    name: string
}) => {
    const [isPending, startTransition] = useTransition()
    const handleDeleteAnElection = (id:Types.ObjectId) => {
        startTransition(async () => {
            const res = await deleteAnElection(id)
            if (res?.success) {
                toast.success(res?.message)
            }
            if (res?.error) {
                toast.error(res.error)
            }
        })
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Trash2 />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[425px]"
                onClick={(e) => e.stopPropagation()}
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
                        disabled={isPending}
                        variant="destructive"
                    >
                        {isPending ? <LoaderCircle className="animate-spin"/> :`Yes, Delete this election.`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteElectionModal
