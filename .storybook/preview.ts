import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'surface',
      values: [
        { name: 'surface', value: '#f7f5ff' },
        { name: 'white', value: '#ffffff' },
        { name: 'container', value: '#e4e7ff' },
      ],
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
