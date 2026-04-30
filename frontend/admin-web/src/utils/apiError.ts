type ApiErrorShape = {
  message?: string;
  details?: string[];
};

// extractApiErrorMessage, backend'in standart hata modelini okunabilir tek bir mesaja indirger.
export function extractApiErrorMessage(error: any, fallbackMessage: string) {
  const data = error?.response?.data as ApiErrorShape | undefined;
  if (Array.isArray(data?.details) && data.details.length > 0) {
    return data.details.join(' ');
  }

  return data?.message ?? fallbackMessage;
}
