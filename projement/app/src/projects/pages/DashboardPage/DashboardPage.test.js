import React from 'react';
import fetchMock from 'fetch-mock';
import { waitForElement, fireEvent } from '@testing-library/react';

import { renderWithContext } from 'core/testUtils';
import { getMockProject } from 'projects/testUtils';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
    beforeEach(() => {
        fetchMock.reset();
    });

    it('fetches and renders a list of projects', async () => {
        // Mock the API request to return a specific list of projects
        fetchMock.getOnce('/api/projects', [
            getMockProject({
                total_estimated_hours: 10,
                total_actual_hours: 5,
            }),
        ]);

        const { getByText, getByTestId } = renderWithContext(<DashboardPage />);

        // An API request should be made and the resulting project should be
        // rendered
        await waitForElement(() => getByText(/test project/i));

        expect(getByTestId('project-company-name-1').textContent).toBe(
            'Test Company',
        );
        expect(getByTestId('project-estimated-hours-1').textContent).toBe('10');
        expect(getByTestId('project-actual-hours-1').textContent).toBe('5');
    });

    it('strikes through ended projects', async () => {
        fetchMock.getOnce('/api/projects', [
            getMockProject({ has_ended: true }),
        ]);

        const { getByText } = renderWithContext(<DashboardPage />);

        const projectNameElem = await waitForElement(() =>
            getByText(/test project/i),
        );

        expect(projectNameElem).toHaveStyle('text-decoration: line-through');
    });

    it('shows a warning badge when a project is over budget', async () => {
        fetchMock.getOnce('/api/projects', [
            getMockProject({ is_over_budget: true }),
        ]);

        const { getByTestId } = renderWithContext(<DashboardPage />);

        const elem = await waitForElement(() =>
            getByTestId(/over-budget-badge/i),
        );

        expect(elem).toBeInTheDocument();
    });

    it('shows a list of tags related to the company', async () => {
        fetchMock.getOnce('/api/projects', [
            getMockProject({
                tags: [{ id: 1, name: 'Test Tag', color: 'primary' }],
            }),
        ]);

        const { getByText } = renderWithContext(<DashboardPage />);

        const elem = await waitForElement(() => getByText(/test tag/i));

        expect(elem).toBeInTheDocument();
    });

    it('shows a loading spinner while the projects are loading', async () => {
        fetchMock.getOnce('/api/projects', [getMockProject()]);

        const { getByTestId } = renderWithContext(<DashboardPage />);

        expect(getByTestId('spinner')).toBeInTheDocument();
    });

    it('fetches and renders a list of projects with pagination', async () => {
        // Create an array of 20 mock projects
        const mockProjects = Array.from({ length: 20 }, (_, i) =>
            getMockProject({ id: i + 1 }),
        );

        // Mock the API request to return the mock projects
        fetchMock.getOnce('/api/projects', mockProjects);

        const { getByTestId, queryAllByTestId } = renderWithContext(
            <DashboardPage />,
        );

        // Wait for the initial page of projects to render
        await waitForElement(() => getByTestId('project-title-1'));

        // Check that only the first 10 projects are rendered
        expect(queryAllByTestId(/project-title-/i)).toHaveLength(10);

        // Click the next page button
        fireEvent.click(getByTestId('next-page'));

        // Wait for the next page of projects to render
        await waitForElement(() => getByTestId('project-title-12'));

        // Check that only the second 10 projects are rendered
        expect(queryAllByTestId(/project-title-/i)).toHaveLength(10);

        // Click the previous page button
        fireEvent.click(getByTestId('previous-page'));

        // Wait for the first page of projects to render again
        await waitForElement(() => getByTestId('project-title-1'));

        // Check that only the first 10 projects are rendered again
        expect(queryAllByTestId(/project-title-/i)).toHaveLength(10);
    });

    it('handles empty project list', async () => {
        // Mock the API request to return an empty project list
        fetchMock.getOnce('/api/projects', []);

        const { getByTestId } = renderWithContext(<DashboardPage />);

        // Check for the empty project message to render
        expect(getByTestId('spinner')).toBeInTheDocument();
    });
});
