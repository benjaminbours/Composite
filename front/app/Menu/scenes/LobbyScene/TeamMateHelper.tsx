// import React from 'react';
// import PersonIcon from '@mui/icons-material/Person';
// import Popper from '@mui/material/Popper';
// import { Side } from '@benjaminbours/composite-core';
// import Brightness7Icon from '@mui/icons-material/Brightness7';
// import ModeNightIcon from '@mui/icons-material/ModeNight';
// import { PlayerState } from '../../../core/adapters/easy-peasy/game';

// interface Props {
//     levelName: string;
//     mate: PlayerState;
//     isMobile: boolean;
// }

// export const TeamMateHelper: React.FC<Props> = ({
//     levelName,
//     mate,
//     isMobile,
// }) => {
//     const [open, setOpen] = React.useState(false);
//     const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

//     const mateName = mate.account?.name || 'Guest';
//     return (
//         <>
//             <div className="team-mate-container">
//                 <div
//                     className="team-mate"
//                     onMouseEnter={
//                         isMobile
//                             ? undefined
//                             : (e) => {
//                                   setAnchorEl(e.currentTarget);
//                                   setOpen((previousOpen) => !previousOpen);
//                               }
//                     }
//                     onMouseLeave={
//                         isMobile
//                             ? undefined
//                             : () => {
//                                   setAnchorEl(null);
//                                   setOpen((previousOpen) => !previousOpen);
//                               }
//                     }
//                     onClick={
//                         isMobile
//                             ? (e) => {
//                                   setAnchorEl((prev) =>
//                                       prev ? null : e.currentTarget,
//                                   );
//                                   setOpen((previousOpen) => !previousOpen);
//                               }
//                             : undefined
//                     }
//                 >
//                     <PersonIcon className="team-mate-icon" />
//                     <p>{mateName}</p>
//                     {mate.side === Side.LIGHT && <Brightness7Icon />}
//                     {mate.side === Side.SHADOW && <ModeNightIcon />}
//                 </div>
//                 {/* {mate.side !== undefined && you.side === undefined && (
//                     <button className="rect-button align-button">Align</button>
//                 )} */}
//             </div>
//             <Popper
//                 id="team-mate-helper"
//                 open={open}
//                 anchorEl={anchorEl}
//                 placement="right"
//                 disablePortal
//             >
//                 <p className="team-mate-help-text">
//                     <b>Team mate:</b> {mateName} <br />
//                     <b>Level:</b> {levelName}
//                     <br />
//                     <b>Side:</b> {mate.side === Side.LIGHT && 'Light'}
//                     {mate.side === Side.SHADOW && 'Shadow'}
//                     <br />
//                 </p>
//             </Popper>
//         </>
//     );
// };
