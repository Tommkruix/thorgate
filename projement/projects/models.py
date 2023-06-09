from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.urls import reverse
from django.utils import timezone
from django.utils.text import slugify


class Tag(models.Model):
    COLOR_CHOICES = (
        ("primary", "Primary"),
        ("secondary", "Secondary"),
        ("success", "Success"),
        ("danger", "Danger"),
        ("warning", "Warning"),
        ("info", "Info"),
        ("light", "Light"),
        ("dark", "Dark"),
    )

    name = models.CharField("Name", max_length=255)
    # For simplicity's sake, we only allow Bootstrap colors to be chosen
    color = models.CharField("Color", choices=COLOR_CHOICES, max_length=128)

    def __str__(self):
        return self.name


class Company(models.Model):
    class Meta:
        verbose_name_plural = "companies"
        indexes = [
            models.Index(fields=["name"]),
        ]

    tags = models.ManyToManyField(Tag, related_name="projects")
    name = models.CharField(max_length=128)

    def __str__(self):
        return self.name


class Project(models.Model):
    company = models.ForeignKey(
        "projects.Company",
        on_delete=models.PROTECT,
        related_name="projects",
        db_index=True,
    )

    title = models.CharField("Project title", max_length=128, db_index=True)
    start_date = models.DateField("Project start date", blank=True, null=True)
    end_date = models.DateField("Project end date", blank=True, null=True)

    estimated_design = models.PositiveSmallIntegerField("Estimated design hours")
    actual_design = models.DecimalField(
        "Actual design hours",
        default=0,
        max_digits=6,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0")),
            MaxValueValidator(Decimal("9999.99")),
        ],
    )

    estimated_development = models.PositiveSmallIntegerField(
        "Estimated development hours"
    )
    actual_development = models.DecimalField(
        "Actual development hours",
        default=0,
        max_digits=6,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0")),
            MaxValueValidator(Decimal("9999.99")),
        ],
    )

    estimated_testing = models.PositiveSmallIntegerField("Estimated testing hours")
    actual_testing = models.DecimalField(
        "Actual testing hours",
        default=0,
        max_digits=6,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0")),
            MaxValueValidator(Decimal("9999.99")),
        ],
    )

    class Meta:
        indexes = [
            models.Index(fields=["title"]),
            models.Index(fields=["start_date"]),
            models.Index(fields=["end_date"]),
        ]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse(
            "project-update", kwargs={"pk": self.pk, "slug": slugify(self.title)}
        )

    @property
    def has_ended(self):
        return self.end_date is not None and self.end_date < timezone.now().date()

    @property
    def total_estimated_hours(self):
        return (
            self.estimated_design + self.estimated_development + self.estimated_testing
        )

    @property
    def total_actual_hours(self):
        return self.actual_design + self.actual_development + self.actual_testing

    @property
    def is_over_budget(self):
        return self.total_actual_hours > self.total_estimated_hours

    @classmethod
    def fetch_projects(cls):
        return cls.objects.select_related("company").all()
