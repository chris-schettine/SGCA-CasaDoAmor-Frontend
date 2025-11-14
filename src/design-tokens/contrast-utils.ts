/**
 * Utilitários para validação de contraste WCAG 2.2 AA
 * 
 * Garante que todas as combinações de cores atendem aos requisitos de acessibilidade
 */

/**
 * Calcula o contraste entre duas cores (WCAG)
 * Retorna valor entre 1 e 21 (21 = máximo contraste)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Converte hex para RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Valida contraste WCAG 2.2 AA
 * - Texto normal: mínimo 4.5:1
 * - Texto grande (18pt+ ou 14pt+ bold): mínimo 3:1
 * - Componentes UI: mínimo 3:1
 */
export const meetsWCAGAA = (
  foreground: string,
  background: string,
  isLargeText = false,
  isUIComponent = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  
  if (isUIComponent) {
    return ratio >= 3.0; // WCAG 2.2 AA para componentes UI
  }
  
  if (isLargeText) {
    return ratio >= 3.0; // WCAG 2.2 AA para texto grande
  }
  
  return ratio >= 4.5; // WCAG 2.2 AA para texto normal
};

/**
 * Valida contraste WCAG 2.2 AAA (mais rigoroso)
 */
export const meetsWCAGAAA = (
  foreground: string,
  background: string,
  isLargeText = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  
  if (isLargeText) {
    return ratio >= 4.5; // WCAG 2.2 AAA para texto grande
  }
  
  return ratio >= 7.0; // WCAG 2.2 AAA para texto normal
};

/**
 * Ajusta cor para melhorar contraste se necessário
 */
export const adjustForContrast = (
  foreground: string,
  background: string,
  minRatio = 4.5
): string => {
  const currentRatio = getContrastRatio(foreground, background);
  
  if (currentRatio >= minRatio) {
    return foreground; // Já atende
  }
  
  // Se não atende, retorna a cor mais escura/clara necessária
  // Esta é uma implementação simplificada - em produção, use uma biblioteca como color
  return foreground; // Por enquanto, retorna original (deve ser ajustado manualmente)
};

