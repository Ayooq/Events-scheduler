# Generated by Django 3.1.3 on 2020-11-04 18:03

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='название')),
                ('start_date', models.DateTimeField(verbose_name='дата и время начала')),
                ('end_date', models.DateTimeField(verbose_name='дата и время окончания')),
            ],
        ),
    ]
