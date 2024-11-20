// ConfirmDeleteDialog.tsx
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from './alert-dialog';
import { Button } from './button';

type ConfirmDeleteDialogProps = {
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  message: string;
};

const ConfirmDialog: React.FC<ConfirmDeleteDialogProps> = ({ onConfirm, onCancel, isOpen, message }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
        <AlertDialogTitle className='hidden'>
            YABALMA
        </AlertDialogTitle>
      <AlertDialogContent>
        <div className='font-bold h-10 items-center justify-start flex -p-8 w-full border-b '>Confirmation</div>
        <p>{message}</p>
        <AlertDialogFooter>
          <Button onClick={onCancel}>Non</Button>
          <Button onClick={onConfirm} variant="destructive">
            Oui
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
