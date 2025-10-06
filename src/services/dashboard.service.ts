import { apiService } from "@/services/api.service.ts";
import { activityService } from "@/services/activity.service.ts";
import { projectService } from "@/services/project.service.ts";
import { organizationService } from "@/services/organization.service.ts";

export interface GlobalDashboardStats {
    totalActivities: number;
    totalProjects: number;
    totalOrganizations: number;
    activeProjects: number;
    completedActivities: number;
    activeOrganizations: number;
}

export const dashboardService = {
    getGlobalStats: async (): Promise<GlobalDashboardStats> => {
        try {
            const [activitiesResponse, projectsResponse, organizationsResponse] = await Promise.all([
                activityService.getList({ page: 1, pageSize: 1 }),
                projectService.getList({ page: 1, pageSize: 1 }),
                organizationService.getList({ page: 1, pageSize: 1 })
            ]);

            const activityStats = await activityService.getActivityStats();

            const activeProjectsResponse = await apiService.getPaginatedList('/api/project/list', {
                page: 1,
                pageSize: 1,
                filters: { status: 'ACTIVE' }
            });

            const activeOrganizationsResponse = await apiService.getPaginatedList('/api/organization/list', {
                page: 1,
                pageSize: 1,
                filters: { status: 'active' }
            });

            return {
                totalActivities: activitiesResponse.count || 0,
                totalProjects: projectsResponse.count || 0,
                totalOrganizations: organizationsResponse.count || 0,
                activeProjects: activeProjectsResponse.count || 0,
                completedActivities: activityStats.completedActivities || 0,
                activeOrganizations: activeOrganizationsResponse.count || 0
            };
        } catch (error) {
            console.error('Error fetching global dashboard stats:', error);
            return {
                totalActivities: 0,
                totalProjects: 0,
                totalOrganizations: 0,
                activeProjects: 0,
                completedActivities: 0,
                activeOrganizations: 0
            };
        }
    },

    getOrganizationStats: async (organizationId: string): Promise<GlobalDashboardStats> => {
        try {
            const orgStats = await organizationService.getOrganizationStats(organizationId);
            
            const projectsResponse = await apiService.getPaginatedList('/api/project/list', {
                page: 1,
                pageSize: 1,
                filters: { organizationId }
            });

            const activitiesResponse = await apiService.getPaginatedList('/api/activity/list', {
                page: 1,
                pageSize: 1,
                filters: { organizationId }
            });

            return {
                totalActivities: activitiesResponse.count || orgStats.ongoing_activities || 0,
                totalProjects: projectsResponse.count || orgStats.active_projects || 0,
                totalOrganizations: 1,
                activeProjects: orgStats.active_projects || 0,
                completedActivities: 0,
                activeOrganizations: 1
            };
        } catch (error) {
            console.error('Error fetching organization dashboard stats:', error);
            return {
                totalActivities: 0,
                totalProjects: 0,
                totalOrganizations: 0,
                activeProjects: 0,
                completedActivities: 0,
                activeOrganizations: 0
            };
        }
    }
};

export default dashboardService;