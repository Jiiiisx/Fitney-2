import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ActionModal({
  isOpen,
  onClose,
  children,
}: ActionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {/* The header is now part of the form components for better control */}
        {/* <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader> */}
        {children}
      </DialogContent>
    </Dialog>
  );
}
