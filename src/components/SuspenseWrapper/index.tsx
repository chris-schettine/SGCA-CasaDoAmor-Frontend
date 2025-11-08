import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper para React Suspense com fallback padrão
 * ✨ Substitui if(isLoading) por Suspense declarativo
 */
export const SuspenseWrapper = ({ children, fallback }: SuspenseWrapperProps) => {
  return (
    <Suspense fallback={fallback || <DefaultSkeleton />}>
      {children}
    </Suspense>
  );
};

/**
 * Skeleton padrão para loading states
 */
const DefaultSkeleton = () => (
  <Box sx={{ width: '100%', p: 3 }}>
    <Stack spacing={2}>
      <Skeleton variant="text" width="40%" height={40} />
      <Skeleton variant="rectangular" width="100%" height={200} />
      <Skeleton variant="rectangular" width="100%" height={200} />
    </Stack>
  </Box>
);

/**
 * Skeleton para tabelas
 */
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <Box sx={{ width: '100%', p: 2 }}>
    <Stack spacing={1}>
      {/* Header */}
      <Skeleton variant="rectangular" width="100%" height={48} />
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" width="100%" height={53} />
      ))}
    </Stack>
  </Box>
);

/**
 * Skeleton para cards
 */
export const CardSkeleton = () => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="text" width="60%" height={32} />
    <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />
    <Skeleton variant="rectangular" width="100%" height={150} sx={{ mt: 2, borderRadius: 1 }} />
    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
    </Stack>
  </Box>
);

/**
 * Skeleton para formulários
 */
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <Box sx={{ p: 3 }}>
    <Stack spacing={3}>
      <Skeleton variant="text" width="50%" height={40} />
      
      {Array.from({ length: fields }).map((_, index) => (
        <Box key={index}>
          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
      
      <Skeleton variant="rectangular" width={150} height={42} sx={{ borderRadius: 1, mt: 2 }} />
    </Stack>
  </Box>
);

/**
 * Skeleton para lista de pacientes
 */
export const PatientListSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton variant="text" width="30%" height={48} />
      <Skeleton variant="rectangular" width={120} height={42} sx={{ borderRadius: 1 }} />
    </Box>
    <TableSkeleton rows={10} />
  </Box>
);

/**
 * Skeleton para perfil de usuário
 */
export const ProfileSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Stack spacing={3} alignItems="center">
      <Skeleton variant="circular" width={120} height={120} />
      <Skeleton variant="text" width="40%" height={32} />
      <Skeleton variant="text" width="60%" height={24} />
      
      <Box sx={{ width: '100%', mt: 4 }}>
        <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
        </Stack>
      </Box>
    </Stack>
  </Box>
);
