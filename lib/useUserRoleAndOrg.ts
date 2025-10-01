import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useUserRoleAndOrg() {
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
  // @ts-ignore
  setRole(session.user.role || null);
  // @ts-ignore
  setOrgId(session.user.orgId || null);
    }
  }, [session]);

  return { role, orgId };
}
