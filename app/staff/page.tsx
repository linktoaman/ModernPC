import { requireStaffSession } from "@/security/staff-auth";

export default async function StaffPage() {
  await requireStaffSession();

  return (
    <main>
      <h1>Staff</h1>
    </main>
  );
}
