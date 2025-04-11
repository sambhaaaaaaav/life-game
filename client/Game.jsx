
// Entry point for the game (React frontend)
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); // update this with your hosted backend URL later

const TILE_COUNT = 50;
const PLAYER_COLORS = ['red', 'blue', 'green', 'purple', 'orange', 'pink'];

const generateBoard = () => {
  return Array.from({ length: TILE_COUNT }, (_, i) => ({
    id: i,
    type: i === 0 ? 'start' : i % 10 === 0 ? 'payday' : 'normal',
  }));
};

export default function Game() {
  const [board, setBoard] = useState(generateBoard);
  const [players, setPlayers] = useState([]);
  const [playerId, setPlayerId] = useState(null);
  const [turn, setTurn] = useState(null);
  const [rolledNumber, setRolledNumber] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      const name = prompt('Enter your name');
      socket.emit('join-game', { name });
    });

    socket.on('init', ({ players, id }) => {
      setPlayers(players);
      setPlayerId(id);
    });

    socket.on('update-players', setPlayers);
    socket.on('update-turn', setTurn);
    socket.on('rolled', setRolledNumber);

    return () => {
      socket.off();
    };
  }, []);

  const handleSpin = () => {
    if (playerId === turn) {
      const spin = Math.ceil(Math.random() * 10);
      socket.emit('spin', { number: spin });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">The Game of Life</h1>
      <div className="grid grid-cols-10 gap-1">
        {board.map((tile) => (
          <div key={tile.id} className="h-16 w-16 border rounded flex items-center justify-center bg-gray-100">
            {tile.id}
            <div className="absolute mt-10 flex space-x-1">
              {players.map(
                (p, i) =>
                  p.position === tile.id && (
                    <div key={p.id} style={{ background: PLAYER_COLORS[i], width: 10, height: 10, borderRadius: '50%' }}></div>
                  )
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSpin} className="px-4 py-2 bg-blue-500 text-white rounded">
        Spin
      </button>
      {rolledNumber && <p>You rolled a {rolledNumber}!</p>}
      {turn === playerId && <p>Your turn!</p>}
    </div>
  );
}
