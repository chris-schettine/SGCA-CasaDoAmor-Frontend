import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import LoadingBackdrop from '../LoadingBackdrop'; 

interface PublicRouteProps {
  children: React.ReactElement;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();


  if (isLoading) {
    return <LoadingBackdrop />; 
  }

  if (isAuthenticated) {
    return <Navigate to="/patients" replace />;
  }


  return children;
};

export default PublicRoute;