# User Data Issues - Diagnosis & Fix Guide

## 📊 Summary of Issues

After analyzing the database, found:
- **Total Users**: 12
- **Users with Issues**: 9
- **Users OK**: 3

### Main Issues:
1. **9 users** have phone ≠ passport
2. **Duplicate phone number** (810249) used by 2 different users

---

## 🔍 Specific Issue: Phone 810249

### Two users found with phone `810249`:

**User #1: "ahmad"**
- Phone: `810249`
- Passport: `QG789542` ❌ (doesn't match)
- Created: March 3, 2026
- Status: pending

**User #2: "siraj"**
- Phone: `810249`
- Passport: `810249` ✅ (matches)
- Created: Later
- Status: pending

### Problem:
When logging in with phone `810249`:
- If using passport `810249` → Gets "siraj" user ✅
- If using passport `QG789542` → Gets "ahmad" user ✅
- If using passport `810249` (trying to login as ahmad) → ❌ FAILS

---

## 🛠️ Fix Options

### Option 1: Quick Fix - Update ahmad's Passport

**Run this script:**
```bash
node fix-810249-users.js
```

**What it does:**
- Changes ahmad's passport from `QG789542` to `810249`
- Both users can now login with same credentials
- ⚠️ Creates another issue: duplicate credentials

**After fix:**
- ahmad: Phone=810249, Passport=810249
- siraj: Phone=810249, Passport=810249
- Both work, but first one (ahmad) will be returned on login

---

### Option 2: Fix All Users at Once

**Run this script:**
```bash
node auto-fix-all-users.js
```

**What it does:**
- Updates ALL 9 users' passports to match their phone numbers
- Makes login simple: Phone = Passport for everyone
- ⚠️ Still leaves duplicate 810249 issue

**Affects these users:**
1. zulfiqar khan - Passport: ASDASD → 12341234
2. Siraj - Passport: 234234 → admin
3. Toheed - Passport: 1234568 → 12345
4. ahmad - Passport: QG789542 → 810249
5. Individual Test User - Passport: IND12345 → 999999
6. adsf - Passport: ASDD → 2334
7. afasdf - Passport: 33 → asdf
8. siraj - Passport: S1234 → 1234
9. toheed ali khan - Passport: 12341 → 23423

---

### Option 3: Manual Fix - Resolve Duplicates

**Steps:**

1. **Decide which user is correct:**
   - Is "ahmad" the real user? Or "siraj"?
   - Which account has real data?

2. **Delete the duplicate:**
   ```javascript
   // If deleting siraj:
   User.findByIdAndDelete("SIRAJ_ID");
   
   // If deleting ahmad:
   User.findByIdAndDelete("69a6ef5faaba98233bbeb14a");
   ```

3. **Update the remaining user's passport:**
   ```javascript
   User.findByIdAndUpdate(
     "69a6ef5faaba98233bbeb14a",
     { passportNumber: "810249" }
   );
   ```

---

## 📋 All Users with Mismatched Data

| # | Name | Phone | Passport | Issue |
|---|------|-------|----------|-------|
| 1 | zulfiqar khan | 12341234 | ASDASD | Mismatch |
| 2 | Siraj | admin | 234234 | Mismatch |
| 3 | Toheed | 12345 | 1234568 | Mismatch |
| 4 | **ahmad** | **810249** | **QG789542** | **Mismatch** |
| 5 | Individual Test User | 999999 | IND12345 | Mismatch |
| 6 | adsf | 2334 | ASDD | Mismatch |
| 7 | afasdf | asdf | 33 | Mismatch |
| 8 | siraj | 1234 | S1234 | Mismatch |
| 9 | toheed ali khan | 23423 | 12341 | Mismatch |
| 10 | alkhaleej | 123456 | 123456 | ✅ OK |
| 11 | Toheed | 2345 | 2345 | ✅ OK |
| 12 | **siraj** | **810249** | **810249** | **✅ OK (Duplicate phone!)** |

---

## 🚀 Recommended Solution

### For Production/Real Users:

1. **First: Identify duplicate phone numbers**
   ```bash
   node check-all-users.js
   ```

2. **Second: Manually resolve duplicates**
   - Delete test/duplicate users
   - Update phone numbers to be unique

3. **Third: Fix remaining mismatches**
   ```bash
   node auto-fix-all-users.js
   ```

### For Testing/Development:

Just run the auto-fix:
```bash
node auto-fix-all-users.js
```

This makes all users login with: Phone = Passport

---

## 🧪 Test Scripts Created

### 1. `check-all-users.js`
Shows all users and identifies issues
```bash
node check-all-users.js
```

### 2. `check-user-data.js`
Detailed analysis of specific user (810249)
```bash
node check-user-data.js
```

### 3. `fix-810249-users.js`
Fixes the duplicate 810249 issue specifically
```bash
node fix-810249-users.js
```

### 4. `auto-fix-all-users.js`
Fixes ALL mismatched users at once
```bash
node auto-fix-all-users.js
```

### 5. `test-correct-credentials.js`
Tests login with correct credentials
```bash
node test-correct-credentials.js
```

---

## ✅ After Fixing

### Test Login:

**For ahmad (after fix):**
```json
{
  "phoneNumber": "810249",
  "passportNumber": "810249"
}
```

**For all other users (after auto-fix):**
- Phone Number = Passport Number
- Example: User with phone "123456" uses passport "123456"

---

## 💡 Best Practice Going Forward

### To prevent this issue:

1. **Enforce unique phone numbers** in User model
2. **Validate data on user creation**
3. **Use phone number as passport by default** if they match
4. **Add validation in admin panel** to prevent duplicates

### Recommended Model Update:

```javascript
// In models/User.js
phoneNumber: {
  type: String,
  required: true,
  unique: true,  // Add this
  trim: true
}
```

---

## 🎯 Quick Decision Tree

**Do you want simple login (Phone = Passport)?**
- ✅ Yes → Run `auto-fix-all-users.js`
- ❌ No → Keep current passport numbers, users must use correct passport

**Do you have duplicate phone numbers?**
- ✅ Yes → Manually delete duplicates first
- ❌ No → Safe to auto-fix

**Is this production data?**
- ✅ Yes → Review each change manually
- ❌ No (test data) → Auto-fix is fine

---

## 🔧 Execute Fix Now

**Recommended command:**
```bash
cd "g:\Qurbani App\backend"
node auto-fix-all-users.js
```

This will:
1. Update 9 users' passports to match phones
2. Make login consistent and simple
3. Preserve existing OK users
4. Skip invalid users

**After running, test:**
```bash
node __tests__\auth.test.js
```

---

**Need help?** Check individual user with:
```bash
node check-user-data.js
```
