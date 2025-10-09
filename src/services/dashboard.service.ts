import {activityService} from "@/services/activity.service.ts";
import {projectService} from "@/services/project.service.ts";
import {organizationService} from "@/services/organization.service.ts";

export interface GlobalDashboardStats {
    totalActivities: number;
    totalProjects: number;
    totalOrganizations: number;
    activeProjects: number;
    completedActivities: number;
    activeOrganizations: number;
    totalMembers?: number;
    organizationAdmins?: number;
    employees?: number;
    members?: number;
    volunteers?: number;
}

export const dashboardService = {
    // getGlobalStats: async (): Promise<GlobalDashboardStats> => {
    //     try {
    //         const [activitiesResponse, projectsResponse, organizationsResponse] = await Promise.all([
    //             activityService.getList({ page: 1, pageSize: 1 }),
    //             projectService.getList({ page: 1, pageSize: 1, filters: { organization_id: organizationId }  }),
    //             organizationService.getList({ page: 1, pageSize: 1 })
    //         ]);
    //
    //         const activityStats = await activityService.getActivityStats();
    //
    //         const activeProjectsResponse = await projectService.getList({
    //             page: 1,
    //             pageSize: 1,
    //             filters: { status: 'ACTIVE' }
    //         });
    //
    //         const activeOrganizationsResponse = await organizationService.getList({
    //             page: 1,
    //             pageSize: 1,
    //             filters: { status: 'active' }
    //         });
    //
    //         return {
    //             totalActivities: activitiesResponse.count || 0,
    //             totalProjects: projectsResponse.count || 0,
    //             totalOrganizations: organizationsResponse.count || 0,
    //             activeProjects: activeProjectsResponse.count || 0,
    //             completedActivities: activityStats.completedActivities || 0,
    //             activeOrganizations: activeOrganizationsResponse.count || 0
    //         };
    //     } catch (error) {
    //         console.error('Error fetching global dashboard stats:', error);
    //         return {
    //             totalActivities: 0,
    //             totalProjects: 0,
    //             totalOrganizations: 0,
    //             activeProjects: 0,
    //             completedActivities: 0,
    //             activeOrganizations: 0
    //         };
    //     }
    // },

    getOrganizationStats: async (organizationId: string): Promise<GlobalDashboardStats> => {
        try {
            const orgStats = await organizationService.getOrganizationStats(organizationId);

            return {
                activities_count: orgStats.activities_count || 0,
                projects_count: orgStats.projects_count || 0,
                organizations_count: 1,
                activeProjects: orgStats.active_projects || 0,
                completedActivities: 0,
                activeOrganizations: 1
            };
        } catch (error) {
            console.error('Error fetching organization dashboard stats:', error);
            return {
                activities_count: 0,
                projects_count: 0,
                organizations_count: 0,
                activeProjects: 0,
                completedActivities: 0,
                activeOrganizations: 0
            };
        }
    }
};

export default dashboardService;