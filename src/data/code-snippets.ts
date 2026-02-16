export const BUGGY_CODE = `class Enemy {
public:
    Vector2 position;
    int health;
};

Enemy* targetLock = nullptr;

void updateGame() {
    for (auto it = enemies.begin(); it != enemies.end();) {
        if (it->health <= 0) {
            // BUG: targetLock still points here!
            delete *it;
            it = enemies.erase(it);
        } else {
            ++it;
        }
    }

    // CRASH: use-after-free
    if (targetLock) {
        shoot(targetLock->position);  // SEGFAULT
    }
}`;

export const FIXED_CODE = `class Enemy {
public:
    Vector2 position;
    int health;
};

Enemy* targetLock = nullptr;

void updateGame() {
    for (auto it = enemies.begin(); it != enemies.end();) {
        if (it->health <= 0) {
            if (targetLock == *it) {
                targetLock = nullptr;  // Clear before delete
            }
            delete *it;
            it = enemies.erase(it);
        } else {
            ++it;
        }
    }

    if (targetLock) {
        shoot(targetLock->position);  // Safe!
    }
}`;

// Line numbers to highlight (1-indexed)
export const BUGGY_HIGHLIGHT_LINES = [12, 13, 14, 21, 22];
export const FIXED_HIGHLIGHT_LINES = [13, 14, 15, 16];
