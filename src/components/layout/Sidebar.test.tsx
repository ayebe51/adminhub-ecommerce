import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Sidebar } from './Sidebar';

describe('Sidebar Component', () => {
  it('renders correctly and shows the logo', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    expect(screen.getByText('AdminHub')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('collapses when the toggle button is clicked', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Initially Expanded
    expect(screen.getByText('AdminHub')).toBeInTheDocument();
    
    // Click Collapse
    const toggleBtn = screen.getByRole('button', { name: /collapse/i });
    fireEvent.click(toggleBtn);
    
    // AdminHub text should be hidden
    expect(screen.queryByText('AdminHub')).not.toBeInTheDocument();
  });
});
