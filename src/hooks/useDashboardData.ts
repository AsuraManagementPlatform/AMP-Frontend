import { useEffect } from 'react';
import { dashboardService, GlobalDashboardStats } from "@/services/dashboard.service";
import { userService } from "@/services/user.service";
import { organizationService } from "@/services/organization.service";
import { projectService } from "@/services/project.service";
import { activityService } from "@/services/activity.service";
import { User } from "@/types/index.types";
import { Organization } from "@/types/organization.types";

interface DashboardDataProps {
    isAdmin: boolean;
    isOrgAdmin: boolean;
    isMember: boolean;
    organizationId?: string;
    setStats: (stats: GlobalDashboardStats) => void;
    setLoading: (loading: boolean) => void;
    setProjectsLoading: (loading: boolean) => void;
    setActivitiesLoading: (loading: boolean) => void;
    setMembersLoading: (loading: boolean) => void;
    setProjects: (projects: any[]) => void;
    setActivities: (activities: any[]) => void;
    setMembers: (members: User[]) => void;
    setOrganizations: (organizations: Organization[]) => void;
    setOrganizationsLoading: (loading: boolean) => void;
}

export const useDashboardData = ({
    isAdmin,
    isOrgAdmin,
    isMember,
    organizationId,
    setStats,
    setLoading,
    setProjectsLoading,
    setActivitiesLoading,
    setMembersLoading,
    setProjects,
    setActivities,
    setMembers,
    setOrganizations,
    setOrganizationsLoading
}: DashboardDataProps) => {

    const loadDashboardData = async () => {
            try {
                setLoading(true);
                
                let dashboardStats: GlobalDashboardStats;
                
                if (isAdmin) {
                    dashboardStats = await dashboardService.getGlobalStats();
                } else if (isOrgAdmin && organizationId) {
                    dashboardStats = await dashboardService.getOrganizationStats(organizationId);
                } else {
                    dashboardStats = {
                        totalActivities: 0,
                        totalProjects: 0,
                        totalOrganizations: 0,
                        activeProjects: 0,
                        completedActivities: 0,
                        activeOrganizations: 0
                    };
                }
                
                setStats(dashboardStats);
                setProjects([]);
                setActivities([]);
                
                if (isAdmin) {
                    try {
                        setMembersLoading(true);
                        setOrganizationsLoading(true);
                        
                        const [usersResponse, organizationsResponse] = await Promise.all([
                            userService.getList({ page: 1, pageSize: 50 }),
                            organizationService.getList({ page: 1, pageSize: 50 })
                        ]);
                        
                        const organizationAdmins = usersResponse.results?.filter(user => 
                            user.groups?.some(group => group.toLowerCase() === 'organization_admin')
                        ) || [];
                        
                        const organizations = (organizationsResponse as any).organizations || organizationsResponse.results || [];
                        setMembers(organizationAdmins);
                        setOrganizations(organizations);
                    } catch (error) {
                        console.error('Error fetching admin data:', error);
                        setMembers([]);
                        setOrganizations([]);
                    } finally {
                        setMembersLoading(false);
                        setOrganizationsLoading(false);
                    }
                } else if (isOrgAdmin) {
                    try {
                        setMembersLoading(true);
                        
                        const usersResponse = await userService.getList({ page: 1, pageSize: 100 });
                        const allMembers = usersResponse.results || [];
                        
                        const countByGroup = (groupName: string) => {
                            return allMembers.filter(user => {
                                if (!user.groups) return false;
                                if (Array.isArray(user.groups)) {
                                    return user.groups.some(g => g.toLowerCase() === groupName.toLowerCase());
                                }
                                if (typeof user.groups === 'string') {
                                    const groupsStr = user.groups as string;
                                    return groupsStr.toLowerCase().includes(groupName.toLowerCase());
                                }
                                return false;
                            }).length;
                        };
                        
                        const orgAdmins = countByGroup('organization_admin');
                        const employees = countByGroup('employee');
                        const volunteers = countByGroup('volunteer');
                        const regularMembers = countByGroup('member');
                        
                        setMembers(allMembers);
                        
                        setStats({
                            ...dashboardStats,
                            totalMembers: allMembers.length,
                            organizationAdmins: orgAdmins,
                            employees: employees,
                            members: regularMembers,
                            volunteers: volunteers
                        });
                    } catch (error) {
                        console.error('Error fetching org admin data:', error);
                        setMembers([]);
                    } finally {
                        setMembersLoading(false);
                    }
                } else if (isMember) {
                    try {
                        setProjectsLoading(true);
                        setActivitiesLoading(true);
                        
                        const [projectsResponse, activitiesResponse] = await Promise.all([
                            projectService.getList({ page: 1, pageSize: 50 }),
                            activityService.getList({ page: 1, pageSize: 50 })
                        ]);
                        
                        setProjects(projectsResponse.results || []);
                        setActivities(activitiesResponse.results || []);
                    } catch (error) {
                        console.error('Error fetching member data:', error);
                        setProjects([]);
                        setActivities([]);
                    } finally {
                        setProjectsLoading(false);
                        setActivitiesLoading(false);
                    }
                    
                    setMembers([]);
                    setOrganizations([]);
                } else {
                    setMembers([]);
                    setOrganizations([]);
                }
                
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setStats({
                    totalActivities: 0,
                    totalProjects: 0,
                    totalOrganizations: 0,
                    activeProjects: 0,
                    completedActivities: 0,
                    activeOrganizations: 0
                });
            } finally {
                setLoading(false);
                setProjectsLoading(false);
                setActivitiesLoading(false);
                setMembersLoading(false);
            }
        };

    useEffect(() => {
        loadDashboardData();
    }, [isAdmin, isOrgAdmin, isMember, organizationId, setStats, setLoading, setProjectsLoading, setActivitiesLoading, setMembersLoading, setProjects, setActivities, setMembers, setOrganizations, setOrganizationsLoading]);

    const refreshOrganizations = async () => {
        if (isAdmin) {
            try {
                setOrganizationsLoading(true);
                const organizationsResponse = await organizationService.getList({ page: 1, pageSize: 50 });
                const organizationsData = (organizationsResponse as any).organizations || organizationsResponse.results || [];
                setOrganizations(organizationsData);
            } catch (error) {
                console.error('Error refreshing organizations:', error);
            } finally {
                setOrganizationsLoading(false);
            }
        }
    };

    const refreshUsers = async () => {
        if (isAdmin) {
            try {
                setMembersLoading(true);
                const usersResponse = await userService.getList({ page: 1, pageSize: 50 });
                const organizationAdmins = usersResponse.results?.filter(user => 
                    user.groups?.some(group => group.toLowerCase() === 'organization_admin')
                ) || [];
                setMembers(organizationAdmins);
            } catch (error) {
                console.error('Error refreshing users:', error);
            } finally {
                setMembersLoading(false);
            }
        }
    };

    return { refreshOrganizations, refreshUsers };
};