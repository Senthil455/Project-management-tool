import { useEffect } from 'react';
import { Icon } from './Icons.jsx';

export default function Modal({ title, onClose, children, width = 700 }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
