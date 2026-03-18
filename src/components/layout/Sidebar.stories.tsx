import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const meta = {
  title: 'Components/Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div style={{ height: '100vh', display: 'flex' }}>
          <Story />
          <div style={{ flex: 1, padding: '20px', background: 'var(--color-background)' }}>
            <h1 style={{ color: 'var(--color-text-primary)' }}>Main Content Area</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>This demonstrates how the sidebar looks next to page content.</p>
          </div>
        </div>
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
