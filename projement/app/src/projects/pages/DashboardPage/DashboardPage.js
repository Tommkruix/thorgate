import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
    Table,
    Badge,
    Pagination,
    PaginationItem,
    PaginationLink,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

import { Spinner } from 'core';
import {
    fetchProjects,
    getProjects,
    getIsLoading,
} from 'projects/ducks/projects';
import { projectType } from 'projects/propTypes';

const PAGE_SIZE = 10;
const BREAK_LABEL = '...';

const DashboardPage = ({ fetchProjects, projects, isLoading }) => {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    if (isLoading) return <Spinner />;

    const calculateProjectHasEnded = project =>
        new Date(project.end_date) <= new Date();

    const renderProjectRow = project => (
        <tr key={project.id}>
            <td data-testid={`project-title-${project.id}`}>
                <Link to={`/projects/${project.id}`}>
                    {calculateProjectHasEnded(project) ? (
                        <s>{project.title}</s>
                    ) : (
                        project.title
                    )}
                </Link>
                {project.is_over_budget && (
                    <Badge
                        color="danger"
                        className="ml-2"
                        data-testid="over-budget-badge"
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </Badge>
                )}
            </td>
            <td data-testid={`project-tags-${project.id}`}>
                {project.tags.map(tag => (
                    <Badge key={tag.id} color={tag.color} className="mr-2">
                        {tag.name}
                    </Badge>
                ))}
            </td>
            <td data-testid={`project-company-name-${project.id}`}>
                {project.company.name}
            </td>
            <td data-testid={`project-estimated-hours-${project.id}`}>
                {project.total_estimated_hours}
            </td>
            <td data-testid={`project-actual-hours-${project.id}`}>
                {project.total_actual_hours}
            </td>
        </tr>
    );

    const totalPages = Math.ceil(projects.length / PAGE_SIZE);

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return (
        <>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>Tags</th>
                        <th>Company</th>
                        <th>Estimated</th>
                        <th>Actual</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.slice(startIndex, endIndex).map(renderProjectRow)}
                </tbody>
            </Table>
            <Pagination>
                <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink
                        data-testid="previous-page"
                        previous
                        onClick={() => setCurrentPage(currentPage - 1)}
                    />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => {
                    if (totalPages > 5 && (i === 2 || i === totalPages - 3)) {
                        return (
                            <PaginationItem key={i} disabled>
                                <PaginationLink>{BREAK_LABEL}</PaginationLink>
                            </PaginationItem>
                        );
                    }
                    if (
                        totalPages > 5 &&
                        ((i > 1 && i < currentPage - 1) ||
                            (i < totalPages - 2 && i > currentPage + 1))
                    ) {
                        return null;
                    }
                    return (
                        <PaginationItem key={i} active={i + 1 === currentPage}>
                            <PaginationLink
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
                <PaginationItem disabled={currentPage === totalPages}>
                    <PaginationLink
                        data-testid="next-page"
                        next
                        onClick={() => setCurrentPage(currentPage + 1)}
                    />
                </PaginationItem>
            </Pagination>
        </>
    );
};

DashboardPage.propTypes = {
    fetchProjects: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    projects: PropTypes.arrayOf(projectType).isRequired,
};

const mapStateToProps = state => ({
    projects: getProjects(state),
    isLoading: getIsLoading(state),
});

const mapDispatchToProps = dispatch => ({
    fetchProjects: () => dispatch(fetchProjects()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
