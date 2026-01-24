#!/usr/bin/env node
/**
 * Script to automatically fix localStorage.getItem("token") usage
 * Replaces with credentials: 'include' for cookie-based auth
 * 
 * Usage: node fix-auth.js
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_FIX = [
    'app/(app)/settings/components/ProfileSettings.tsx',
    'app/(app)/settings/components/AppearanceSettings.tsx',
    'app/(app)/nutrition/components/NutritionResults.tsx',
    'app/(app)/nutrition/components/AddFoodModal.tsx',
    'app/(app)/goals/components/GoalTimeline.tsx',
    'app/(app)/dashboard/page.tsx',
    'app/(app)/components/NotificationPopup.tsx',
    'app/(app)/components/CompleteProfileBanner.tsx',
    'app/(app)/components/forms/LogWorkoutForm.tsx',
    'app/(app)/community/profile/[userId]/page.tsx',
    'app/(app)/community/post/[postId]/page.tsx',
    'app/(app)/community/groups/[id]/page.tsx',
    'app/(app)/community/friends/page.tsx',
    'app/(app)/community/find-friends/page.tsx',
];

function fixFile(filePath) {
    const fullPath = path.join(__dirname, filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Pattern 1: Remove token variable and update fetch with Authorization header
    const pattern1 = /const token = localStorage\.getItem\("token"\);[\s\S]*?fetch\(([^,]+),\s*\{[\s\S]*?headers:\s*\{([^}]*?)Authorization:\s*`Bearer \$\{token\}`([^}]*?)\}/g;

    if (pattern1.test(content)) {
        content = content.replace(
            /const token = localStorage\.getItem\("token"\);\s*/g,
            ''
        );

        // Replace Authorization header with credentials
        content = content.replace(
            /headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}/g,
            'credentials: \'include\''
        );

        content = content.replace(
            /headers:\s*\{\s*([^}]+),\s*Authorization:\s*`Bearer \$\{token\}`\s*\}/g,
            'credentials: \'include\',\n        headers: { $1 }'
        );

        content = content.replace(
            /headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`,\s*([^}]+)\s*\}/g,
            'credentials: \'include\',\n        headers: { $1 }'
        );

        modified = true;
    }

    if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        return true;
    } else {
        console.log(`ℹ️  No changes needed: ${filePath}`);
        return false;
    }
}

console.log('🔧 Starting automatic auth migration...\n');

let fixedCount = 0;
FILES_TO_FIX.forEach(file => {
    if (fixFile(file)) {
        fixedCount++;
    }
});

console.log(`\n✨ Done! Fixed ${fixedCount}/${FILES_TO_FIX.length} files.`);
console.log('\n⚠️  Please review changes and test thoroughly!');
