from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand


COURSE_MODELS = (
    'section',
    'module',
    'lesson',
    'question',
    'courseenrollment',
    'quizresult',
    'userprogress',
    'learningactivityprogress',
)


GROUPS = {
    'KTZ Academy Administrator': {
        'permissions': 'all_course_and_auth',
    },
    'Training Officer': {
        'permissions': (
            'courses.*',
            'auth.view_user',
            'auth.view_group',
        ),
    },
    'Course Instructor': {
        'permissions': (
            'courses.view_section',
            'courses.view_module',
            'courses.view_lesson',
            'courses.view_question',
            'courses.change_lesson',
            'courses.change_question',
            'courses.view_quizresult',
            'courses.view_userprogress',
            'courses.view_learningactivityprogress',
        ),
    },
    'Learner': {
        'permissions': (),
    },
}


class Command(BaseCommand):
    help = 'Create useful KTZ Academy admin groups and assign role-based permissions.'

    def handle(self, *args, **options):
        course_permissions = Permission.objects.filter(content_type__app_label='courses')
        auth_permissions = Permission.objects.filter(
            content_type__app_label='auth',
            content_type__model__in=('user', 'group'),
        )
        all_course_and_auth = course_permissions | auth_permissions

        for group_name, config in GROUPS.items():
            group, created = Group.objects.get_or_create(name=group_name)
            permission_spec = config['permissions']

            if permission_spec == 'all_course_and_auth':
                permissions = all_course_and_auth
            else:
                permissions = Permission.objects.none()

                for item in permission_spec:
                    app_label, codename = item.split('.', 1)

                    if codename == '*':
                        permissions |= Permission.objects.filter(content_type__app_label=app_label)
                    else:
                        permissions |= Permission.objects.filter(
                            content_type__app_label=app_label,
                            codename=codename,
                        )

            group.permissions.set(permissions.distinct())
            status = 'created' if created else 'updated'
            self.stdout.write(
                self.style.SUCCESS(
                    f'{group_name}: {status}, {group.permissions.count()} permission(s).'
                )
            )
