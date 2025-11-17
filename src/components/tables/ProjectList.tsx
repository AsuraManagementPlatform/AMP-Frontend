import React from 'react';
import {Project} from '@/types/index.types';
import {useTableData} from "@/hooks/useTableData";

interface ProjectListProps {
    onEdit?: (project: Project) => void;
    onView?: (project: Project) => void;
    onDelete?: (project: Project) => void;
    onRowClick?: (project: Project) => void;
    refreshTrigger?: number;
    canDeleteProject?: (project: Project) => boolean;
    className?: string;
    pageSize?: number;
}

const ProjectList: React.FC<ProjectListProps> = ({
                                                     onRowClick,
                                                     className = '',
                                                     refreshTrigger = 0,
}) => {
    const {data: projects = [], loading, error } = useTableData<Project>({
        endpoint: "project/list",
        initialPageSize: 20,
        refreshTrigger: refreshTrigger,
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-gray-600">Se încarcă proiectele...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Eroare la încărcarea proiectelor: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                    Încearcă din nou
                </button>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {projects.map((project) => (
                <div
                    key={project.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onRowClick?.(project)}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-1">{project.description}</p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                <span>Status: {project.status}</span>
                                <span>Buget: {project.budget?.toLocaleString()} RON</span>
                                {project.startingDate && (
                                    <span>Început: {new Date(project.startingDate).toLocaleDateString('ro-RO')}</span>
                                )}
                                {project.endingDate && (
                                    <span>Final: {new Date(project.endingDate).toLocaleDateString('ro-RO')}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectList;

