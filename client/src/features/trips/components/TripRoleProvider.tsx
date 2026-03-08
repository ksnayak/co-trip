import { createContext } from "react";
import type { TripRole } from "@/hooks/useTripRole";

type TripRoleContextValue = {
  role: TripRole;
  canEdit: boolean;
  isOwner: boolean;
};

export const TripRoleContext = createContext<TripRoleContextValue | null>(null);

export function TripRoleProvider({
  role,
  children,
}: {
  role: TripRole;
  children: React.ReactNode;
}) {
  const canEdit = role === "owner" || role === "editor";
  const isOwner = role === "owner";

  return (
    <TripRoleContext.Provider value={{ role, canEdit, isOwner }}>
      {children}
    </TripRoleContext.Provider>
  );
}
