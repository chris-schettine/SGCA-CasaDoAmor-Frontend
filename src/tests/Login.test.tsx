import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../pages/Login'
import { authService } from '../api/auth.service'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastContainer } from 'react-toastify'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ login: vi.fn(), isAuthenticated: false, isLoading: false })
}))

describe('Página de Login', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza campos de nome, senha e botão de login', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
          <ToastContainer />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByLabelText(/CPF/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('exibe snackbar de erro quando loginApi lança erro', async () => {
  // Simula erro no formato do axios: error.response.data.message
  vi.spyOn(authService, 'login').mockRejectedValue({ response: { data: { message: 'API indisponível' } } })

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
          <ToastContainer />
        </AuthProvider>
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText(/CPF/i), { target: { value: '12345678901' } })
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'senha' } })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/API indisponível/i)).toBeInTheDocument()
    })
  })
})
