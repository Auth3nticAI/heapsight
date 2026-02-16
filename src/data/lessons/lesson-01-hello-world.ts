import type { Lesson } from "@/types/lesson";

export const lesson01: Lesson = {
  id: "01-hello-world",
  title: "Hello, World!",
  description: "Write your first C++ program and print to the console.",
  order: 1,
  xpReward: 50,
  tier: "free",
  instructions: `# Hello, World!

Every C++ program starts with a \`main()\` function. To print text to the console, we use \`cout\` from the \`<iostream>\` library.

## Key Concepts
- **\`#include <iostream>\`** — imports the input/output library
- **\`using namespace std;\`** — lets us write \`cout\` instead of \`std::cout\`
- **\`cout << "text"\`** — prints text to the console
- **\`endl\`** — adds a newline at the end

## Your Task
Write a program that prints exactly:
\`\`\`
Hello, World!
\`\`\`

Make sure to include a newline at the end using \`endl\` or \`"\\n"\`.`,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Write your code here

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: 'Output should be "Hello, World!"',
      expectedOutput: "Hello, World!\n",
    },
  ],
  hints: [
    'Use `cout << "text"` to print text.',
    "Don't forget `endl` or `\"\\n\"` at the end.",
    'The full line is: `cout << "Hello, World!" << endl;`',
  ],
  concepts: ["#include", "main()", "cout", "endl"],
};
