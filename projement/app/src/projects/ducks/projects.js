import { combineReducers } from 'redux';

/**
 * State key for the projects' duck. This should be used to access the duck's
 * state whenever needed. For example, `state[STATE_KEY].projects`.
 */
export const STATE_KEY = 'projects';

// Actions

const RECEIVE_PROJECTS = `${STATE_KEY}/RECEIVE_PROJECTS`;
const RECEIVE_UPDATED_PROJECT = `${STATE_KEY}/RECEIVE_UPDATED_PROJECT`;

const SET_LOADING = `${STATE_KEY}/SET_LOADING`;

// Reducers

const projectsReducer = (state = [], action) => {
    switch (action.type) {
        case RECEIVE_PROJECTS:
            return action.projects;
        case RECEIVE_UPDATED_PROJECT:
            return state.map(project =>
                project.id === action.project.id ? action.project : project,
            );

        default:
            return state;
    }
};

const isLoadingReducer = (state = false, action) => {
    switch (action.type) {
        case SET_LOADING:
            return action.isLoading;
        case RECEIVE_PROJECTS:
            return false;

        default:
            return state;
    }
};

export default combineReducers({
    projects: projectsReducer,
    isLoading: isLoadingReducer,
});

// Action creators

const receiveProjects = projects => ({
    type: RECEIVE_PROJECTS,
    projects,
});

const receiveUpdatedProject = project => ({
    type: RECEIVE_UPDATED_PROJECT,
    project,
});

const setIsLoading = isLoading => ({ type: SET_LOADING, isLoading });

/**
 * Thunk to fetch the list of projects and save them to the store.
 */
export const fetchProjects = () => async dispatch => {
    dispatch(setIsLoading(true));

    let response;
    try {
        const result = await fetch('/api/projects').then(res => res.json());
        response = result.sort((a, b) => {
            if (a.has_ended === b.has_ended)
                return new Date(b.end_date) - new Date(a.end_date);
            else if (a.has_ended) return 1;
            else return -1;
        });
    } catch (e) {
        return console.error(e);
    }

    dispatch(receiveProjects(response));

    return response;
};

/**
 * Get the project with the project ID.
 */
const getProject = async projectId => {
    let response;
    try {
        response = await fetch(`/api/projects/${projectId}`).then(res =>
            res.json(),
        );
    } catch (e) {
        return console.error(e);
    }

    return response;
};

/**
 * Update the project with the given values.
 */
export const updateProject = (projectId, projectValues) => async dispatch => {
    let response;
    try {
        const projectResponse = await getProject(projectId);

        if (projectResponse != undefined && projectResponse != null) {
            const {
                actual_design,
                actual_development,
                actual_testing,
            } = projectResponse;

            projectValues = {
                actual_design: (
                    parseFloat(projectValues.actual_design) +
                    parseFloat(actual_design)
                ).toFixed(2),
                actual_development: (
                    parseFloat(projectValues.actual_development) +
                    parseFloat(actual_development)
                ).toFixed(2),
                actual_testing: (
                    parseFloat(projectValues.actual_testing) +
                    parseFloat(actual_testing)
                ).toFixed(2),
            };
        }

        response = await fetch(`/api/projects/${projectId}/`, {
            method: 'PUT',
            body: JSON.stringify(projectValues),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': DJ_CONST.csrfToken,
            },
        });
    } catch (e) {
        return console.error(e);
    }

    const json = await response.json();
    if (response.status === 400) {
        // We got some validation errors
        throw json;
    }

    dispatch(receiveUpdatedProject(json));

    return response;
};

// Selectors

export const getProjects = state => state[STATE_KEY].projects;
export const getIsLoading = state => state[STATE_KEY].isLoading;
