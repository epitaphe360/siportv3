import React from 'react';
import { render } from 'react-dom';
import ChatInterface from './components/chat/ChatInterface';

// Test simple pour vérifier si le composant se rend correctement
const TestChat = () => {
  console.log('Testing ChatInterface component...');
  return <ChatInterface />;
};

// Cette fonction sera appelée depuis le navigateur
window.testChat = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  render(<TestChat />, container);
  console.log('ChatInterface rendered successfully');
};

console.log('Chat test script loaded');
