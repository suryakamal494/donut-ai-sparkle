import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockUsers, User } from "@/data/mockData";
import { UserViewDialog } from "@/components/users";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewDialog(true);
  };

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <PageHeader
        title="Direct Users"
        description="Manage users registered directly on the platform"
        breadcrumbs={[{ label: "Dashboard", href: "/superadmin/dashboard" }, { label: "Users" }]}
        actions={<Button className="gradient-button gap-2"><Plus className="w-4 h-4" />Add User</Button>}
      />

      <div className="bg-card rounded-2xl p-3 md:p-4 shadow-soft border border-border/50">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Class</TableHead>
                <TableHead className="hidden lg:table-cell">Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div>
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.mobile}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.class}</TableCell>
                  <TableCell className="hidden lg:table-cell">{user.course}</TableCell>
                  <TableCell><StatusBadge status={user.status} /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewUser(user)}><Eye className="w-4 h-4 mr-2" />View</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <UserViewDialog
        user={selectedUser}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />
    </div>
  );
};

export default Users;
