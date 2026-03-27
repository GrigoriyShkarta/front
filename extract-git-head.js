const cp = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    const cwd = 'c:\\Users\\Dell\\WebstormProjects\\lirnexa\\front';
    const filePath = 'src/components/layout/boards/custom-board/custom-board-canvas.tsx';
    const result = cp.execSync(`git show HEAD:${filePath}`, { cwd });
    fs.writeFileSync(path.join(cwd, 'src/components/layout/boards/custom-board/custom-board-canvas.old.tsx'), result);
    console.log("Successfully extracted old file. Length:", result.length, "bytes.");
} catch (e) {
    console.error(e.message);
}
