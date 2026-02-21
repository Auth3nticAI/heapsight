// warmup.cpp — Pre-warms ccache during Docker build.
// This file is compiled once at image build time so that subsequent
// student compiles hit the ccache for raylib header processing.
// It is deleted after compilation; it never runs at runtime.

#include "raylib.h"
#include <iostream>

int main() {
    InitWindow(640, 640, "HeapSight");
    SetTargetFPS(60);

    std::cout << "Warmup: OK" << std::endl;

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(100, 100, 200, 200, GREEN);
        DrawText("HeapSight Warmup", 120, 180, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}
