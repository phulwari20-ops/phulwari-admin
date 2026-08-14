import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update KPI condition
content = content.replace(
    "{activeTab !== 'packages' && activeTab !== 'birthday_page' && activeTab !== 'blogs' && activeTab !== 'reviews' && activeTab !== 'birthdays' && activeTab !== 'dashboard' && activeTab !== 'gallery' && activeTab !== 'announcements' && activeTab !== 'teachers' && (",
    "{(activeTab === 'erp' || activeTab === 'fee') && ("
)

# 2. Update Gallery sorting
content = content.replace(
    "const res = await fetch(`${supabaseUrl}/rest/v1/gallery?select=*`, {",
    "const res = await fetch(`${supabaseUrl}/rest/v1/gallery?select=*&order=created_at.desc`, {"
)

with open('app/page.tsx', 'w') as f:
    f.write(content)

