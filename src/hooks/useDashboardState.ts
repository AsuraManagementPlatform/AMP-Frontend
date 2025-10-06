import { useState, useMemo } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/index.types";
import { Project } from "@/types/project.types";
import { Activity } from "@/types/activity.types";
import { UserMeResponse } from "@/types/user.types";
import { Organization } from "@/types/organization.types";
import { GlobalDashboardStats } from "@/services/dashboard.service";

export const useDashboardState = () => {
    const { user } = useAuth();

    const [stats, setStats] = useState<GlobalDashboardStats>({
        totalActivities: 0,
        totalProjects: 0,
        totalOrganizations: 0,
        activeProjects: 0,
        completedActivities: 0,
        activeOrganizations: 0
    });
    const [loading, setLoading] = useState(true);

    const [projects, setProjects] = useState<Project[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [availableProjects] = useState<Project[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [organizationsLoading, setOrganizationsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
    const [createdUserData, setCreatedUserData] = useState<UserMeResponse | null>(null);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false);
    const [isOrgDetailsModalOpen, setIsOrgDetailsModalOpen] = useState(false);

    const isAdmin = useMemo(() => 
        user?.groups?.some(group => group.toLowerCase() === 'admin') || false, [user]);
    const isOrgAdmin = useMemo(() => 
        user?.groups?.some(group => group.toLowerCase() === 'organization_admin') || false, [user]);
    const isMember = useMemo(() => 
        user?.groups?.some(group => group.toLowerCase() === 'member') || false, [user]);
    const hasOrganization = useMemo(() => !!user?.organization_id, [user?.organization_id]);

    const filteredMembers = members.filter(member => 
        member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOrganizations = organizations.filter(org =>
        org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        user,
        isAdmin,
        isOrgAdmin,
        isMember,
        hasOrganization,

        stats,
        setStats,
        loading,
        setLoading,

        projects,
        setProjects,
        activities,
        setActivities,
        projectsLoading,
        setProjectsLoading,
        activitiesLoading,
        setActivitiesLoading,
        selectedProject,
        setSelectedProject,
        availableProjects,
        members,
        setMembers,
        membersLoading,
        setMembersLoading,
        organizations,
        setOrganizations,
        organizationsLoading,
        setOrganizationsLoading,
        searchTerm,
        setSearchTerm,
        filteredMembers,
        filteredOrganizations,

        isCreateUserModalOpen,
        setIsCreateUserModalOpen,
        isCreateOrgModalOpen,
        setIsCreateOrgModalOpen,
        createdUserData,
        setCreatedUserData,
        isCreateProjectModalOpen,
        setIsCreateProjectModalOpen,
        isCreateActivityModalOpen,
        setIsCreateActivityModalOpen,
        isOrgDetailsModalOpen,
        setIsOrgDetailsModalOpen
    };
};