import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkoutTemplates } from '../WorkoutTemplates';
import { workoutPrograms } from '@/app/lib/workout-templates';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(workoutPrograms),
  })
) as jest.Mock;

describe('WorkoutTemplates Component', () => {
  it('should render the title and fetch programs when opened', async () => {
    const onOpenChange = jest.fn();

    render(<WorkoutTemplates open={true} onOpenChange={onOpenChange} />);

    // Check if the main title is rendered
    expect(screen.getByText('Workout Templates')).toBeInTheDocument();
    expect(screen.getByText('Choose a pre-made plan to kickstart your journey.')).toBeInTheDocument();

    // Check for loading state initially
    expect(screen.getByText('Loading programs...')).toBeInTheDocument();

    // Wait for the programs to be fetched and displayed
    await waitFor(() => {
      // The loading text should disappear
      expect(screen.queryByText('Loading programs...')).not.toBeInTheDocument();
      // The program from our mock data should be visible
      expect(screen.getByText('Program Pemula: Full Body')).toBeInTheDocument();
    });
  });

  it('should show an error message if fetching fails', async () => {
    // Override the fetch mock to simulate an error
    (fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
      })
    );

    const onOpenChange = jest.fn();
    render(<WorkoutTemplates open={true} onOpenChange={onOpenChange} />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch workout programs')).toBeInTheDocument();
    });
  });
});
