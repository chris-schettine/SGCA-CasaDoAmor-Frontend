import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../pages/Login'
import * as api from '../api/api'
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
    vi.spyOn(api, 'loginApi').mockRejectedValue(new Error('API indisponível'))

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

import * as rtl from '@testing-library/react'
const { render, fireEvent, waitFor, screen } = rtl
import Login from '../pages/Login'
import * as api from '../api/api'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthContext'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ login: vi.fn() })
}))

describe('Login page', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders username and password fields and login button', () => {
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

  it('shows an error snackbar when loginApi throws', async () => {
    const spy = vi.spyOn(api, 'loginApi').mockRejectedValue(new Error('API down'))

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'user' } })
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'pass' } })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/API down/i)).toBeInTheDocument()
    })

    spy.mockRestore()
  })
})
