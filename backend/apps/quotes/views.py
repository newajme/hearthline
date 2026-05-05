from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Quote
from .serializers import QuoteSerializer


class QuoteList(generics.ListCreateAPIView):
    queryset = Quote.objects.all().order_by("-created_at")
    serializer_class = QuoteSerializer
    permission_classes = [IsAuthenticated]


class QuoteDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    permission_classes = [IsAuthenticated]
