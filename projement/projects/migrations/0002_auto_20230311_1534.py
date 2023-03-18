# Generated by Django 2.2.7 on 2023-03-11 15:34

from decimal import Decimal
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='actual_design',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=6, validators=[django.core.validators.MinValueValidator(Decimal('0')), django.core.validators.MaxValueValidator(Decimal('9999.99'))], verbose_name='Actual design hours'),
        ),
        migrations.AlterField(
            model_name='project',
            name='actual_development',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=6, validators=[django.core.validators.MinValueValidator(Decimal('0')), django.core.validators.MaxValueValidator(Decimal('9999.99'))], verbose_name='Actual development hours'),
        ),
        migrations.AlterField(
            model_name='project',
            name='actual_testing',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=6, validators=[django.core.validators.MinValueValidator(Decimal('0')), django.core.validators.MaxValueValidator(Decimal('9999.99'))], verbose_name='Actual testing hours'),
        ),
    ]
