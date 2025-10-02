import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useUserRoleAndOrg() {
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      // @ts-ignore
      const userRole = session.user.role || null;
      // @ts-ignore
      const userOrgId = session.user.orgId || null;
      
      console.log('useUserRoleAndOrg: Session user:', session.user);
      console.log('useUserRoleAndOrg: Role extracted:', userRole);
      console.log('useUserRoleAndOrg: OrgId extracted:', userOrgId);
      
      setRole(userRole);
      setOrgId(userOrgId);
    } else {
      console.log('useUserRoleAndOrg: No session or user found');
      setRole(null);
      setOrgId(null);
    }
  }, [session]);

  return { role, orgId };
}
