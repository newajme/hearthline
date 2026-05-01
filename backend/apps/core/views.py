from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Business, Channel
from .serializers import BusinessSerializer, ChannelSerializer


class BusinessListCreate(generics.ListCreateAPIView):
    queryset = Business.objects.all().order_by("-created_at")
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated]


class BusinessDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated]


class ChannelListCreate(generics.ListCreateAPIView):
    """List/create channels — accepts ?business=<id> filter."""
    serializer_class = ChannelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Channel.objects.all().order_by("kind")
        biz = self.request.query_params.get("business")
        if biz:
            qs = qs.filter(business_id=biz)
        return qs

    def perform_create(self, serializer):
        # Channel needs a business; default to first if not provided.
        business_id = self.request.data.get("business")
        if business_id:
            business = Business.objects.filter(pk=business_id).first()
        else:
            business = Business.objects.first()
        serializer.save(business=business)


class ChannelDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer
    permission_classes = [IsAuthenticated]
