// vendors
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '@mui/material';

interface Props {
    open: boolean;
    title: string;
    message: string | React.ReactNode;
    onCancel: () => void;
    onConfirm: () => void;
    cancelText: string;
    confirmText: string;
    isLoading: boolean;
    className?: string;
}

export const ConfirmDialog: React.FC<Props> = ({
    open,
    onCancel,
    onConfirm,
    title,
    message,
    cancelText,
    confirmText,
    className,
    isLoading,
}) => {
    return (
        <Dialog
            className={className}
            aria-labelledby="confirmation-dialog-title"
            open={open}
        >
            <DialogTitle className="title-h3">{title}</DialogTitle>
            <DialogContent dividers>{message}</DialogContent>
            <DialogActions>
                <Button autoFocus onClick={onCancel} color="primary">
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    color="primary"
                    disabled={isLoading}
                    variant="contained"
                >
                    {isLoading ? <CircularProgress size={24} /> : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
