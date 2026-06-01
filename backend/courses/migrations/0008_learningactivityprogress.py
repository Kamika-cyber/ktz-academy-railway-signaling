from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0007_question_explanation_en_question_explanation_kz_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='LearningActivityProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activity_type', models.CharField(choices=[('directory_card', 'Directory card'), ('simulator', 'Simulator')], max_length=32)),
                ('activity_key', models.CharField(max_length=80)),
                ('is_completed', models.BooleanField(default=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activity_progress', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['activity_type', 'activity_key'],
                'unique_together': {('user', 'activity_type', 'activity_key')},
            },
        ),
    ]
