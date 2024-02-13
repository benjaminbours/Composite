import React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

interface Props {
    buttonText: string;
    items: {
        onClick: () => void;
        icon: React.ReactNode;
        text: string;
    }[];
}

export const DropDownMenu: React.FC<Props> = ({ items, buttonText }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Button
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="outlined"
                endIcon={<KeyboardArrowDownIcon />}
                size="small"
            >
                {buttonText}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {items.map(({ text, icon, onClick }, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => {
                            handleClose();
                            onClick();
                        }}
                    >
                        <ListItemIcon>{icon}</ListItemIcon>
                        <ListItemText>{text}</ListItemText>
                        {/* <Typography variant="body2" color="text.secondary">
                            ⌘X
                        </Typography> */}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
