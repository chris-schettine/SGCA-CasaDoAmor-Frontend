/**
 * @fileoverview Service for fetching Agendamentos (Appointments) Statistics
 * @module api/agendamentoEstatisticas.service
 * 
 * Provides methods to retrieve comprehensive appointment statistics including:
 * - General metrics (today, week, month, year)
 * - Status distribution
 * - Type classification (patients vs companions)
 * - Priority and appointment type breakdowns
 * - Confirmation tracking
 * - Top professionals and services
 * - Time distributions (weekly, hourly)
 * - Attendance and performance rates
 */

import { api } from './api.gateway';
import type { EstatisticasAgendamentoDTO } from './agendamentoEstatisticas.dto';

/**
 * Service for Agendamentos Statistics operations
 * 
 * @example
 * ```typescript
 * import { agendamentoEstatisticasService } from '@/api/agendamentoEstatisticas.service';
 * 
 * // Fetch complete statistics
 * const stats = await agendamentoEstatisticasService.obterEstatisticas();
 * console.log('Appointments today:', stats.totalAgendamentosHoje);
 * console.log('Top professional:', stats.topProfissionaisPorAgendamentos[0]);
 * ```
 */
class AgendamentoEstatisticasService {
  private readonly BASE_PATH = '/api/agendamentos/estatisticas';

  /**
   * Retrieve complete appointment statistics
   * 
   * Aggregates data from both patient and companion appointments to provide
   * real-time metrics and analytics for appointment management.
   * 
   * **Endpoint:** `GET /api/agendamentos/estatisticas`
   * 
   * **Authorization:** Required (JWT Bearer token)
   * 
   * **Authorized Roles:**
   * - ADMINISTRADOR
   * - GERENTE
   * - RECEPCIONISTA
   * - MEDICO
   * - ENFERMEIRO
   * - NUTRICIONISTA
   * - DENTISTA
   * 
   * @returns Promise resolving to complete statistics object
   * 
   * @throws {Error} If request fails (401 Unauthorized, 403 Forbidden, 500 Internal Server Error)
   * 
   * @example
   * ```typescript
   * try {
   *   const stats = await agendamentoEstatisticasService.obterEstatisticas();
   *   
   *   // Display summary cards
   *   console.log(`Today: ${stats.totalAgendamentosHoje}`);
   *   console.log(`This week: ${stats.totalAgendamentosSemana}`);
   *   console.log(`This month: ${stats.totalAgendamentosMes}`);
   *   
   *   // Show status breakdown
   *   console.log(`Scheduled: ${stats.agendamentosAgendados}`);
   *   console.log(`Confirmed: ${stats.agendamentosConfirmados}`);
   *   console.log(`Completed: ${stats.agendamentosConcluidos}`);
   *   
   *   // Display performance metrics
   *   console.log(`Attendance rate: ${stats.taxaComparecimento.toFixed(2)}%`);
   *   console.log(`No-show rate: ${stats.taxaNaoComparecimento.toFixed(2)}%`);
   *   console.log(`Avg duration: ${stats.duracaoMediaMinutos} minutes`);
   *   
   *   // Top performers
   *   stats.topProfissionaisPorAgendamentos.forEach(prof => {
   *     console.log(`${prof.profissionalNome}: ${prof.totalAgendamentos} appointments`);
   *   });
   * } catch (error) {
   *   console.error('Failed to fetch statistics:', error);
   * }
   * ```
   */
  async obterEstatisticas(): Promise<EstatisticasAgendamentoDTO> {
    try {
      const response = await api.get<EstatisticasAgendamentoDTO>(this.BASE_PATH);
      
      if (import.meta.env.DEV) {
        console.log('[Agendamentos Stats] Response received:', {
          status: response.status,
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data).length : 0,
        });
      }
      
      return response.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('[Agendamentos Stats] Request failed:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  }
}

/**
 * Singleton instance of AgendamentoEstatisticasService
 * 
 * Import this instance to access appointment statistics throughout the application.
 * 
 * @example
 * ```typescript
 * import { agendamentoEstatisticasService } from '@/api/agendamentoEstatisticas.service';
 * 
 * const DashboardPage = () => {
 *   const [stats, setStats] = useState(null);
 *   
 *   useEffect(() => {
 *     agendamentoEstatisticasService.obterEstatisticas()
 *       .then(setStats)
 *       .catch(console.error);
 *   }, []);
 *   
 *   // Render dashboard with stats...
 * };
 * ```
 */
export const agendamentoEstatisticasService = new AgendamentoEstatisticasService();
