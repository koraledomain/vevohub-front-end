import api from '../utils/api';
import { IUserManagementItem, IUserManagementTableFilters } from '../types/user';

export type UserManagementResponseAPI = {
    content: IUserManagementItem[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};

// Mock data for development - replace with actual API call
const MOCK_USERS: IUserManagementItem[] = [
    {
        id: '1',
        fullName: 'Leslie Maya',
        email: 'leslie@gmail.com',
        location: 'Los Angeles, CA',
        joined: new Date('2015-05-20'),
        permissions: 'Admin',
        avatarUrl: undefined,
    },
    {
        id: '2',
        fullName: 'Mike Dean',
        email: 'mike@gmail.com',
        location: 'Cheyenne, WY',
        joined: new Date('2018-03-13'),
        permissions: 'Admin',
        avatarUrl: undefined,
    },
    {
        id: '3',
        fullName: 'Mateus Cunha',
        email: 'cunha@gmail.com',
        location: 'Cheyenne, WY',
        joined: new Date('2018-03-14'),
        permissions: 'Admin',
        avatarUrl: undefined,
    },
    {
        id: '4',
        fullName: 'Nzola Uemo',
        email: 'nzola@gmail.com',
        location: 'Syracuse, NY',
        joined: new Date('2011-10-03'),
        permissions: 'Viewer',
        avatarUrl: undefined,
    },
    {
        id: '5',
        fullName: 'Antony Mack',
        email: 'mack@gmail.com',
        location: 'Luanda, AN',
        joined: new Date('2010-10-02'),
        permissions: 'Admin',
        avatarUrl: undefined,
    },
    {
        id: '6',
        fullName: 'André da Silva',
        email: 'andré@gmail.com',
        location: 'Lagos, NG',
        joined: new Date('2016-06-05'),
        permissions: 'Admin',
        avatarUrl: undefined,
    },
    {
        id: '7',
        fullName: 'Jorge Ferreira',
        email: 'jorge@gmail.com',
        location: 'London, ENG',
        joined: new Date('2015-06-15'),
        permissions: 'Admin',
        avatarUrl: undefined,
    },
    {
        id: '8',
        fullName: 'Alex Pfeiffer',
        email: 'alex@gmail.com',
        location: 'São Paulo, BR',
        joined: new Date('2015-07-14'),
        permissions: 'Admin',
        avatarUrl: undefined,
    },
    {
        id: '9',
        fullName: 'Josie Deck',
        email: 'josie@gmail.com',
        location: 'Huambo, Angola',
        joined: new Date('2016-10-01'),
        permissions: 'Admin',
        avatarUrl: undefined,
    },
];

export async function fetchUsers(
    page: number,
    size: number,
    filters: IUserManagementTableFilters
): Promise<UserManagementResponseAPI> {
    try {
        // TODO: Replace with actual API endpoint when available
        // For now, using mock data with filtering
        let filteredUsers = [...MOCK_USERS];

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredUsers = filteredUsers.filter(
                (user) =>
                    user.fullName.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    user.location.toLowerCase().includes(searchLower)
            );
        }

        // Apply permissions filter
        if (filters.permissions && filters.permissions !== 'All') {
            filteredUsers = filteredUsers.filter((user) => user.permissions === filters.permissions);
        }

        // Apply joined date filter
        if (filters.joined && filters.joined !== 'Anytime') {
            const now = new Date();
            filteredUsers = filteredUsers.filter((user) => {
                const joinedDate = typeof user.joined === 'string' ? new Date(user.joined) : user.joined;
                switch (filters.joined) {
                    case 'Today':
                        return joinedDate.toDateString() === now.toDateString();
                    case 'This Week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return joinedDate >= weekAgo;
                    case 'This Month':
                        return joinedDate.getMonth() === now.getMonth() && joinedDate.getFullYear() === now.getFullYear();
                    case 'This Year':
                        return joinedDate.getFullYear() === now.getFullYear();
                    default:
                        return true;
                }
            });
        }

        // Apply pagination
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        return {
            content: paginatedUsers,
            totalElements: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / size),
            size,
            number: page,
        };
    } catch (error) {
        console.error('Error fetching users', error);
        throw error;
    }
}

