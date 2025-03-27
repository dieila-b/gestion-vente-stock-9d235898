
import React from 'react';

interface PreorderHeaderProps {
  isEditing: boolean;
}

export function PreorderHeader({ isEditing }: PreorderHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-2">
        {isEditing ? 'Modifier la précommande' : 'Nouvelle précommande'}
      </h1>
      <p className="text-muted-foreground">
        {isEditing ? 'Modifiez les détails de la précommande' : 'Gérez les précommandes des clients'}
      </p>
    </div>
  );
}
