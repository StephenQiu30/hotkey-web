"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  resourceName: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  resourceName,
  onConfirm,
  loading = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-2 leading-6">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <span className="text-muted-foreground">即将删除：</span>
          <p className="mt-1 break-words font-medium">{resourceName}</p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {loading ? "删除中" : "确认删除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
