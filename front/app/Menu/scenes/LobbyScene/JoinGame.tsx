// vendors
import React, { useEffect, useState } from 'react';
import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { LobbyV3 } from '@hathora/cloud-sdk-typescript/models/components';
// local
import { FLAG_MAP } from '../../../constants';
import { useGlobalContext } from '../../../contexts';

interface Props {
    // rooms: any[];
}

export const JoinGame: React.FC<Props> = ({}) => {
    const [rooms, setRooms] = useState<LobbyV3[]>([]);
    const { joinGame } = useGlobalContext();

    useEffect(() => {
        const hathoraCloud = new HathoraCloud({
            appId: process.env.NEXT_PUBLIC_HATHORA_APP_ID,
        });
        hathoraCloud.lobbiesV3
            .listActivePublicLobbies(process.env.NEXT_PUBLIC_HATHORA_APP_ID)
            .then((rooms) => {
                console.log('HERE rooms', rooms);
                setRooms(rooms);
            });
    }, []);

    return (
        <div className="join-game">
            <table>
                <thead>
                    <tr>
                        <th>Players</th>
                        <th>Region</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map((room) => {
                        return (
                            <tr key={room.roomId}>
                                <td>1/2</td>
                                <td>
                                    {FLAG_MAP[room.region]} {room.region}
                                </td>
                                <td>
                                    <button
                                        className="composite-button"
                                        onClick={() => joinGame(room)}
                                    >
                                        Join
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
