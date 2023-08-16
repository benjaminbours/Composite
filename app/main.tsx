import './styles/main.scss';
import './Menu/crossBrowser';
import React from 'react';
import { createRoot } from 'react-dom/client';
import MainApp from './MainApp';

const root = createRoot(document.querySelector('#root')!);
root.render(<MainApp />);
