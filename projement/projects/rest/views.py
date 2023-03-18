from rest_framework import viewsets, permissions

from projects.models import Project
from projects.rest.serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.fetch_projects()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
