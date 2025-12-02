# Professional Management - Backend Endpoints Required

## Overview
The ProfissionalRegister component requires the following backend API endpoints to function correctly.

## Required Endpoints

### 1. List Categories
**Endpoint:** `GET /api/profissionais/categorias`

**Response Format:**
```json
[
  {
    "id": "1",
    "nome": "Médico",
    "descricao": "Profissionais da medicina",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  {
    "id": "2",
    "nome": "Enfermeiro",
    "descricao": "Profissionais de enfermagem",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### 2. List Tipos de Vínculo
**Endpoint:** `GET /api/profissionais/tipos-vinculo`

**Response Format:**
```json
[
  {
    "id": "1",
    "nome": "Funcionário CLT",
    "descricao": "Vínculo de trabalho CLT",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  {
    "id": "2",
    "nome": "Terceirizado",
    "descricao": "Profissional terceirizado",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### 3. Create Professional
**Endpoint:** `POST /api/profissionais`

**Request Body:**
```json
{
  "nome_completo": "João Silva",
  "cpf": "123.456.789-00",
  "telefone": "(11) 98765-4321",
  "email": "joao@example.com",
  "categoria_id": "1",
  "area_atuacao": "Clínica Geral",
  "especialidade": "Cardiologia",
  "numero_registro": "CRM123456",
  "uf_registro": "SP",
  "data_admissao": "2025-01-15",
  "carga_horaria": "40",
  "cargo_funcao": "Médico Senior",
  "departamento": "Cardiologia",
  "tipo_vinculo_id": "1",
  "endereco": {
    "cep": "01310100",
    "logradouro": "Avenida Paulista",
    "numero": "1578",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "estado": "SP",
    "complemento": "Apto 1000"
  },
  "observacoes": "Profissional com experiência em cardiologia",
  "disponibilidade": {
    "segunda": ["08:00-12:00", "14:00-18:00"],
    "terca": ["08:00-12:00", "14:00-18:00"],
    "quarta": ["08:00-12:00", "14:00-18:00"],
    "quinta": ["08:00-12:00", "14:00-18:00"],
    "sexta": ["08:00-12:00", "14:00-18:00"]
  },
  "created_by": "uuid-do-usuario-logado"
}
```

**Response Format:**
```json
{
  "id": "prof-uuid-123",
  "uuid": "prof-uuid-123",
  "nome_completo": "João Silva",
  "cpf": "123.456.789-00",
  "telefone": "(11) 98765-4321",
  "email": "joao@example.com",
  "categoria_id": "1",
  "area_atuacao": "Clínica Geral",
  "especialidade": "Cardiologia",
  "numero_registro": "CRM123456",
  "uf_registro": "SP",
  "data_admissao": "2025-01-15",
  "carga_horaria": 40,
  "cargo_funcao": "Médico Senior",
  "departamento": "Cardiologia",
  "tipo_vinculo_id": "1",
  "endereco_id": "endereco-uuid-123",
  "ativo": true,
  "observacoes": "Profissional com experiência em cardiologia",
  "disponibilidade": {
    "segunda": ["08:00-12:00", "14:00-18:00"],
    "terca": ["08:00-12:00", "14:00-18:00"],
    "quarta": ["08:00-12:00", "14:00-18:00"],
    "quinta": ["08:00-12:00", "14:00-18:00"],
    "sexta": ["08:00-12:00", "14:00-18:00"]
  },
  "created_by": "uuid-do-usuario-logado",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

## Field Validations (Frontend)

The frontend form enforces the following validations:

| Field | Type | Requirements | Notes |
|-------|------|--------------|-------|
| nome_completo | string | Required, max 255 chars | Full name |
| cpf | string | Required, valid CPF format | Masked: XXX.XXX.XXX-XX |
| telefone | string | Required, valid phone format | Masked: (XX) XXXXX-XXXX |
| email | string | Required, valid email | Max 255 chars |
| categoria_id | string | Required, must exist | Fetched from `/api/profissionais/categorias` |
| area_atuacao | string | Required, max 100 chars | Work area |
| especialidade | string | Required, max 100 chars | Specialty |
| numero_registro | string | Required, max 50 chars | Professional registration number |
| uf_registro | string | Required, max 2 chars | State code (2 uppercase letters) |
| data_admissao | date | Required, YYYY-MM-DD format | Admission date |
| carga_horaria | number | Required, 1-44 range | Working hours per week |
| cargo_funcao | string | Required, max 100 chars | Job title/function |
| departamento | string | Required, max 100 chars | Department |
| tipo_vinculo_id | string | Required, must exist | Fetched from `/api/profissionais/tipos-vinculo` |
| cep | string | Required, 8 digits | Postal code |
| logradouro | string | Required, max 255 chars | Street address |
| numero | string | Required, max 20 chars | Street number |
| complemento | string | Optional, max 150 chars | Address complement |
| bairro | string | Required, max 100 chars | Neighborhood |
| cidade | string | Required, max 100 chars | City |
| estado | string | Required, max 2 chars | State code (2 uppercase letters) |
| observacoes | string | Optional, max 500 chars | Additional notes |
| disponibilidade | object | Optional | Scheduling by day (segunda-domingo) |
| lgpd_consent | boolean | Required | User must accept data privacy terms |

## Error Handling

The frontend expects the following error response format:

```json
{
  "message": "Error description",
  "errors": {
    "field_name": "Field-specific error message"
  }
}
```

## Notes

1. **Address Handling**: The frontend creates a temporary address object and sends it with the professional data. The backend should:
   - Create the address record in the `endereco` table
   - Return the `endereco_id` in the professional response
   - Store the `endereco_id` reference in the professional record

2. **Category & Tipo Vinculo**: These are dropdown options and must be fetched from the backend. If the endpoints don't exist, the form will show a warning and allow submission without these fields.

3. **Availability**: The `disponibilidade` field is optional and can be null/empty if no scheduling is needed.

4. **User Context**: The `created_by` field is populated with the logged-in user's UUID.

5. **CEP Auto-fill**: The frontend uses the public ViaCEP API to auto-fill address fields when a valid CEP is entered. This is client-side only and doesn't require backend support.

## Testing Checklist

- [ ] GET /api/profissionais/categorias returns array of CategoriaDTO with valid IDs
- [ ] GET /api/profissionais/tipos-vinculo returns array of TipoVinculoDTO with valid IDs
- [ ] POST /api/profissionais successfully creates professional with all fields
- [ ] POST /api/profissionais validates required fields
- [ ] POST /api/profissionais creates separate endereco record
- [ ] POST /api/profissionais returns professional object with UUID
- [ ] Professional record is created with ativo = true
- [ ] created_by is stored correctly
- [ ] Availability object is stored correctly (or null if empty)
