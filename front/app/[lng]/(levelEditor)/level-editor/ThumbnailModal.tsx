'use client';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';
import { getDictionary } from '../../../../getDictionary';
import { LevelPortal } from '../../../Menu/scenes/LevelPortal';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    isModalOpen: boolean;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    thumbnailSrc: string | undefined;
    levelName: string;
    onSave: () => void;
}

export const ThumbnailModal: React.FC<Props> = ({
    isModalOpen,
    dictionary,
    setIsModalOpen,
    thumbnailSrc,
    levelName,
    onSave,
}) => {
    return (
        <Modal
            className="level-editor-modal thumbnail-modal"
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
        >
            <Paper className="level-editor-modal__container">
                <Typography variant="h6" component="h2">
                    The portal to your level is gonna look like this, is it good
                    enough for you?
                </Typography>
                {thumbnailSrc && (
                    <LevelPortal name={levelName} src={thumbnailSrc} />
                )}
                <div className="level-editor-modal__button-container">
                    <Button
                        variant="contained"
                        size="small"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => setIsModalOpen(false)}
                    >
                        {`Take another shoot`}
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={onSave}
                    >
                        {`Save`}
                    </Button>
                </div>
            </Paper>
        </Modal>
    );
};
