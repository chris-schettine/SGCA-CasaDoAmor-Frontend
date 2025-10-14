import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import { vi } from 'vitest'
import * as useAuthModule from '../hooks/useAuth'

vi.mock('../components/LoadingBackdrop', () => ({
  default: () => <div data-testid="loading">carregando</div>
}))

vi.mock('../hooks/useAuth')

describe('PrivateRoute', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('exibe loading quando isLoading é true', () => {
    (useAuthModule as any).useAuth = () => ({ isAuthenticated: false, isLoading: true })

    render(
      <MemoryRouter initialEntries={["/"]}>
        <PrivateRoute>
          <div>protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('redireciona para /login quando não autenticado', () => {
    (useAuthModule as any).useAuth = () => ({ isAuthenticated: false, isLoading: false })

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/login" element={<div>página de login</div>} />
          <Route path="/" element={<PrivateRoute><div>ok</div></PrivateRoute>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/página de login/i)).toBeInTheDocument()
  })

  it('renderiza os filhos quando autenticado', () => {
    (useAuthModule as any).useAuth = () => ({ isAuthenticated: true, isLoading: false })

    render(
      <MemoryRouter initialEntries={["/"]}>
        <PrivateRoute>
          <div>conteúdo protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    )

    expect(screen.getByText(/conteúdo protegido/i)).toBeInTheDocument()
  })
})
