export interface Farmer{
    uuid: string;
    name: string;
    email?: string;
    is_superadmin?: boolean;
    must_change_password?: boolean;
}
