from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0007_vapi_assistant_id"),
    ]

    operations = [
        migrations.AddField(
            model_name="business",
            name="currency",
            field=models.CharField(
                choices=[
                    ("USD", "US Dollar ($)"),
                    ("EUR", "Euro (€)"),
                    ("GBP", "British Pound (£)"),
                    ("PKR", "Pakistani Rupee (Rs)"),
                    ("INR", "Indian Rupee (₹)"),
                    ("AED", "UAE Dirham (د.إ)"),
                    ("CAD", "Canadian Dollar (C$)"),
                    ("AUD", "Australian Dollar (A$)"),
                    ("SAR", "Saudi Riyal (﷼)"),
                ],
                default="USD",
                help_text="ISO-4217 code Anna quotes prices in and the dashboard formats with.",
                max_length=3,
            ),
        ),
    ]
