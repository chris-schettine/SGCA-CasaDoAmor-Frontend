import EditIcon from "@mui/icons-material/Edit";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, CircularProgress } from "@mui/material"
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../api/admin.service';
import type { PageUserResponseDTO, UserResponseDTO } from '../../../api/admin.dto';

interface Column {
  id: 'name' | 'function' | 'email' | 'telephone' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'center';
}

const columns: readonly Column[] = [
  { id: 'name', label: 'Nome', minWidth: 170 },
  { id: 'function', label: 'Função', minWidth: 100 },
  { id: 'email', label: 'E-mail', minWidth: 170 },
  { id: 'telephone', label: 'Telefone', minWidth: 100 },
  { id: 'actions', label: 'Ações', minWidth: 100, align: 'center' },
]

// we intentionally store full UserResponseDTO objects in state, no small Row type needed

interface TableUsersProps {
  searchText?: string;
}

const TableUsers = ({ searchText }: TableUsersProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // keep the full DTOs from the backend so other properties are available if needed
  const [rows, setRows] = useState<UserResponseDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchText || '');

  // debounce searchText
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText || ''), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const pageable = { page, size: rowsPerPage, searchText: debouncedSearch };
  const res: PageUserResponseDTO = await adminService.listUsers(pageable);
  // store the full user DTOs; rendering below will read the fields it needs
  setRows(res.content || []);
        setTotal(res.totalElements);
      } catch (err) {
        console.error('Erro ao buscar usuários', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [page, rowsPerPage, debouncedSearch]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }

  const navigate = useNavigate();
  const handleEdit = (id: number) => {
    navigate(`/user/edit/${id}`);
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
      <TableContainer sx={{ maxHeight: 440 }} >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <CircularProgress />
          </div>
        ) : (
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, backgroundColor: '#ccc' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.nome}</TableCell>
                <TableCell>{row.tipo}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.telefone}</TableCell>
                <TableCell align="center">
                  <IconButton color="success"
                    onClick={() => handleEdit(row.id)}
                    aria-label="editar"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        )}
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

export default TableUsers;