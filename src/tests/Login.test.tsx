import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../pages/Login'
import { authService } from '../api/auth.service'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthContext'

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
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('exibe snackbar de erro quando loginApi lança erro', async () => {
  vi.spyOn(authService, 'login').mockRejectedValue(new Error('API indisponível'))

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'usuario' } })
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'senha' } })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/API indisponível/i)).toBeInTheDocument()
    })
  })
})
