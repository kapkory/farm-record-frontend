export interface Farmer{
    uuid: string;
    name: string;
    email?: string;
    is_superadmin?: boolean;
    must_change_password?: boolean;
    /** owner | manager | staff — role on the farmer this user belongs to. */
    role?: 'owner' | 'manager' | 'staff' | null;
    /** Owners and managers see money; staff do not. */
    can_view_finances?: boolean;
    /** null means every farm they can reach; a list pins them to those. */
    allowed_farm_uuids?: string[] | null;
}
