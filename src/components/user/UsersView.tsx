'use client';

import { useState } from 'react';
import { Users as UserPlus } from 'lucide-react';
import { UserSearch } from './UserSearch';
import { useDashboardPage } from '@/hooks/useDashboardPage';
import { useUsers } from '@/hooks/user.hook';
// import { useDepartments } from '@/hooks/department.hook';
import { Loader2, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { User } from '@/types/users';
import { toast } from 'sonner';
import { UserSummary } from './UserSummary';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

export function UsersView() {
    const [isMounted] = useState(() => typeof window !== 'undefined');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const { setPage } = useDashboardPage();
    const { users, loading, error, fetchUsers, handleDeleteUser } = useUsers();
    // const { fetchDepartments } = useDepartments();

    if (!isMounted) return null;

    const handleEdit = (userId: string) => setPage(`users/edit?id=${userId}`);
    const handleView = (user: User) => {
        setSelectedUser(user);
        setIsOpen(true);
    };
    const handleRegisterClick = () => setPage('users/create');
    const handleDelete = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await handleDeleteUser(userId);
            fetchUsers();
            toast.success('User deleted successfully');
        }
    };

    const filteredUsers = Array.isArray(users)
        ? users.filter((user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <div className="space-y-8 relative min-h-screen bg-gradient-to-br from-background to-muted/50">
            {/* Header */}
            <Card className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4 border-0 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        View and manage registered users in the system.
                    </p>
                </div>
                <Button
                    onClick={handleRegisterClick}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <UserPlus className="w-4 h-4" /> Register New User
                </Button>
            </Card>

            {/* Search */}
            <div className="relative">
                <UserSearch query={searchQuery} setQuery={setSearchQuery} />
            </div>

            {/* Users Table */}
            <Card className="border-0 shadow-sm px-4">
                {!loading && !error && (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-accent/50">
                                        <TableHead className="w-[200px]">Name</TableHead>
                                        <TableHead>Employee ID</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Salary</TableHead>
                                        <TableHead className="w-[250px]">Email</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user, index) => (
                                            <TableRow
                                                key={user.id}
                                                className="animate-in slide-in-from-bottom-2 duration-300 cursor-pointer hover:bg-accent"
                                                style={{ '--delay': `${index * 50}ms` } as React.CSSProperties}
                                                onClick={() => handleView(user)}
                                            >
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.employeeId}</TableCell>
                                                <TableCell>{user.department}</TableCell>
                                                <TableCell>{user.position || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {user.salary ? `$${Number(user.salary).toLocaleString()}` : 'N/A'}
                                                </TableCell>
                                                <TableCell className="truncate max-w-[250px]">{user.email}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge
                                                        variant={user.status === 'active' ? 'default' : 'secondary'}
                                                        className={
                                                            user.status === 'active'
                                                                ? 'bg-gray-900 hover:bg-gray-950'
                                                                : 'bg-gray-500 hover:bg-gray-600'
                                                        }
                                                    >
                                                        {user.status?.toUpperCase() || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(user.id);
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(user.id);
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                <Users className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                                                <p className="text-xl font-medium text-muted-foreground">No users found.</p>
                                                <p className="text-sm text-muted-foreground/70 mt-1">
                                                    {searchQuery ? 'Try adjusting your search terms.' : 'Get started by registering a new user.'}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                        </div>

                        <div>
                            <UserSummary users={filteredUsers} />
                        </div>
                    </>
                )}
            </Card>

            {/* View User Dialog */}
            {isOpen && selectedUser && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
                    <DialogContent className="max-w-md z-50">
                        <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                            <DialogDescription>View the details of the selected user.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2 flex justify-between items-center border-t pt-4">
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <h4 className="font-medium">Name</h4>
                                        <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Employee ID</h4>
                                        <p className="text-sm text-muted-foreground">{selectedUser.employeeId}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Department</h4>
                                        <p className="text-sm text-muted-foreground">{selectedUser.department}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Position</h4>
                                        <p className="text-sm text-muted-foreground">{selectedUser.position || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Salary</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedUser.salary ? `$${Number(selectedUser.salary).toLocaleString()}` : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {selectedUser.image && (
                                    <div className="flex justify-center">
                                        <img
                                            src={selectedUser.image}
                                            alt={selectedUser.name}
                                            className="w-32 h-32 rounded-full object-cover border border-gray-200"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 flex justify-between items-center border-t pt-4">
                                <div>
                                    <h4 className="font-medium">Email</h4>
                                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium">Phone Number</h4>
                                    <p className="text-sm text-muted-foreground">{selectedUser.phoneNumber || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Location</h4>
                                <p className="text-sm text-muted-foreground">{selectedUser.location || 'N/A'}</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Status</h4>
                                <Badge variant={selectedUser.status === 'active' ? 'default' : 'secondary'}>
                                    {selectedUser.status?.toUpperCase() || 'N/A'}
                                </Badge>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Loading State */}
            {loading && (
                <Card className="flex flex-col items-center justify-center p-12 border-0 shadow-sm">
                    <div className="relative">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <div className="absolute inset-0 w-8 h-8 border-2 border-primary/20 rounded-full animate-pulse"></div>
                    </div>
                    <span className="mt-4 text-muted-foreground">Loading users...</span>
                </Card>
            )}

            {/* Error State */}
            {error && (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-0 shadow-sm bg-destructive/5">
                    <Users className="w-12 h-12 text-destructive mb-4" />
                    <p className="text-lg font-medium text-destructive">Failed to load users.</p>
                    <Button onClick={fetchUsers} className="mt-4 px-6 py-2.5" variant="destructive">
                        Retry
                    </Button>
                </Card>
            )}
        </div>
    );
}
