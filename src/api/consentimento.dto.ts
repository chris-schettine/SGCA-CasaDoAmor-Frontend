/**
 * DTOs para Consentimento LGPD
 */

export interface ConsentimentoLGPDRequest {
  versaoTermo: string;
  escopo: string;
  concorda: boolean;
  ipOrigem?: string;
  userAgent?: string;
  metadata?: string;
}

export interface ConsentimentoLGPDResponse {
  id: number;
  uuid: string;
  profissionalUuid: string;
  versaoTermo: string;
  escopo: string;
  concorda: boolean;
  ipOrigem?: string;
  userAgent?: string;
  metadata?: string;
  dataConsentimento: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface PageConsentimentoResponseDTO {
  content: ConsentimentoLGPDResponse[];
  pageable: PageableObject;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: SortObject[];
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface PageableObject {
  offset: number;
  sort: SortObject[];
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

export interface SortObject {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}
