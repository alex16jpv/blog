#!/usr/bin/env python

from datetime import datetime

# Get the current date and time
now = datetime.utcnow()

# Format the date and time in the required format
formatted_date = now.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

# Print the formatted date and time
print(formatted_date)