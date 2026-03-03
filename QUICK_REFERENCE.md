# 🔍 Quick Reference: Search & Filter Features

## Users Page

### Search Box
```
┌─────────────────────────────────────────────────────┐
│  Search by name, passport, or phone...             │
└─────────────────────────────────────────────────────┘
```
**Searches in:** Name, Passport Number, Phone Number

### Filters
```
┌───────────────┐ ┌───────────┐ ┌───────────┐ ┌─────────┐
│ All Account   │ │ All Status│ │ All Types │ │ Camel   │
│ Types    ▼    │ │      ▼    │ │      ▼    │ │    ▼    │
├───────────────┤ ├───────────┤ ├───────────┤ ├─────────┤
│ Individual    │ │ Pending   │ │ Sheep     │ └─────────┘
│ Group         │ │ Ready     │ │ Cow       │
└───────────────┘ │ Done      │ │ Camel     │
                  └───────────┘ └───────────┘
```

### Results
```
📊 Showing 8 of 45 users - Search: "ahmed"

[Clear All Filters (3)]
```

### Pagination
```
┌──────┐ ┌──────────┐               ┌──────┐ ┌──────┐
│ First│ │ Previous │  Page 2 of 5  │ Next │ │ Last │
└──────┘ └──────────┘               └──────┘ └──────┘
```

---

## Groups Page

### Search Box
```
┌─────────────────────────────────────────────────────┐
│  Search by group name...                            │
└─────────────────────────────────────────────────────┘
```
**Searches in:** Group Name

### Filters
```
┌───────────┐ ┌───────────┐ ┌─────────┐
│ All Status│ │ All Types │ │ Filters │
│      ▼    │ │      ▼    │ │ Active  │
├───────────┤ ├───────────┤ └─────────┘
│ Pending   │ │ Sheep     │
│ Ready     │ │ Cow       │
│ Done      │ │ Camel     │
└───────────┘ └───────────┘
```

### Results
```
📊 Showing 12 of 12 groups

[Clear All Filters (2)]
```

---

## Qurbani Requests Page

### Search Box
```
┌─────────────────────────────────────────────────────┐
│  Search by name, group, or passport...              │
└─────────────────────────────────────────────────────┘
```
**Searches in:** User Name, Passport, Phone, Group Name

### Filters
```
┌───────────────┐ ┌───────────┐ ┌───────────┐ ┌────────────┐
│ All Account   │ │ All Status│ │ All Types │ │ [📥 Export]│
│ Types    ▼    │ │      ▼    │ │      ▼    │ │  to CSV    │
├───────────────┤ ├───────────┤ ├───────────┤ └────────────┘
│ Individual    │ │ Pending   │ │ Sheep     │
│ Group         │ │ Ready     │ │ Cow       │
└───────────────┘ │ Done      │ │ Camel     │
                  └───────────┘ └───────────┘
```

### Results
```
📊 Showing 10 of 78 Qurbani requests

[Clear All Filters (0)]
```

---

## 💡 Quick Tips

### ⚡ Search Tips
1. **Wait 500ms** - Search triggers after you stop typing
2. **Be specific** - Use full passport numbers for exact matches
3. **Partial matches** - Type any part of name/number
4. **Case insensitive** - "AHMED" and "ahmed" both work

### 🎯 Filter Tips
1. **Combine filters** - Stack multiple filters for precision
2. **Clear quickly** - Use "Clear All Filters" button
3. **Watch the count** - Badge shows active filter count
4. **Check results** - Summary shows what's displayed

### 📄 Pagination Tips
1. **Navigate fast** - Use First/Last buttons
2. **Browse sequentially** - Previous/Next for page-by-page
3. **Filters persist** - Your filters stay active across pages
4. **See location** - "Page X of Y" shows your position

### 📥 Export Tips (Qurbani Page)
1. **Filter first** - Apply filters before exporting
2. **Check filename** - Includes current date
3. **Excel ready** - Opens directly in spreadsheet apps
4. **Current view** - Exports what you see (filtered results)

---

## 🎨 Visual Indicators

### Active Filter Badge
```
[Clear All Filters (3)]
      👆 Number of active filters
```

### Disabled Button
```
┌──────────┐
│ Previous │  ← Grayed out (you're on page 1)
└──────────┘
```

### Search Input Focus
```
┌─────────────────────────────────────┐
│  ahmed                              │  ← Blue border when typing
└─────────────────────────────────────┘
```

### Filter Dropdown Selected
```
┌───────────┐
│ Pending ✓ │  ← Selected value shown
└───────────┘
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between filters |
| `Enter` | Apply dropdown selection |
| `Esc` | Close dropdown (browser default) |
| Type in search | Auto-focus search box |

---

## 📱 Mobile View

Filters stack vertically on mobile:

```
┌─────────────────────┐
│  Search...          │
└─────────────────────┘
┌─────────────────────┐
│ All Account Types ▼ │
└─────────────────────┘
┌─────────────────────┐
│ All Status ▼        │
└─────────────────────┘
┌─────────────────────┐
│ All Types ▼         │
└─────────────────────┘
```

---

## 🔄 Common Workflows

### Find a Specific User
1. Type name or passport in search
2. Wait for results (500ms)
3. Scroll through matches

### View All Pending Groups
1. Select "Pending" from status filter
2. Results update automatically
3. Navigate pages if needed

### Export Completed Qurbani
1. Select "Done" status
2. Select "Cow" type (optional)
3. Click "Export to CSV"
4. Open downloaded file

### Reset Everything
1. Click "Clear All Filters"
2. All filters reset to default
3. Returns to page 1
4. Shows all items

---

## ❓ FAQ

**Q: How fast is the search?**  
A: Results appear 500ms after you stop typing.

**Q: Can I search multiple fields at once?**  
A: Yes! Search looks across name, passport, and phone simultaneously.

**Q: Do filters work together?**  
A: Yes! All filters use AND logic (must match all selected).

**Q: How many items per page?**  
A: 10 items per page (configurable in code).

**Q: What does "Clear All Filters" do?**  
A: Resets all filters, clears search, returns to page 1.

**Q: Can I export all data or just filtered?**  
A: Exports current filtered/searched results only.

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Search not working | Wait 500ms after typing |
| No results shown | Check if filters are too restrictive |
| Pagination stuck | Try "Clear All Filters" |
| Export button missing | Only shows when results exist |
| Slow performance | Clear filters, reduce search scope |

---

**Need Help?** Check [SEARCH_FILTER_GUIDE.md](SEARCH_FILTER_GUIDE.md) for detailed documentation.
