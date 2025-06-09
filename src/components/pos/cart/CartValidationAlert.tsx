
interface CartValidationAlertProps {
  hasValidationErrors: boolean;
}

export function CartValidationAlert({ hasValidationErrors }: CartValidationAlertProps) {
  if (!hasValidationErrors) return null;

  return (
    <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
      ⚠️ Veuillez corriger les erreurs de quantité avant de procéder au paiement
    </div>
  );
}
