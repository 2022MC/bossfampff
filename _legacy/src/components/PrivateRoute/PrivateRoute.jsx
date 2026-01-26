import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        // Redirect to /login but KEEP the query parameters (e.g. ?pass=bossfampf)
        return <Navigate to={`/login${location.search}`} replace />;
    }

    return children;
};

export default PrivateRoute;
