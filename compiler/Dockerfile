FROM emscripten/emsdk:3.1.51

# Make emscripten tools available to all RUN commands
ENV PATH="/emsdk:/emsdk/upstream/emscripten:/emsdk/upstream/bin:/emsdk/node/16.20.0_64bit/bin:${PATH}"
ENV EMSDK="/emsdk"
ENV EM_CONFIG="/emsdk/.emscripten"
ENV EMSDK_NODE="/emsdk/node/16.20.0_64bit/bin/node"

# Install ccache
RUN apt-get update && apt-get install -y --no-install-recommends ccache && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/ccache

# Clone raylib 5.5
RUN git clone --depth 1 --branch 5.5 https://github.com/raysan5/raylib.git /tmp/raylib

# Compile raylib to WASM static library
WORKDIR /tmp/raylib/src
RUN emcc -c rcore.c -Os -DPLATFORM_WEB -DGRAPHICS_API_OPENGL_ES2 -o rcore.o && \
    emcc -c rshapes.c -Os -DPLATFORM_WEB -DGRAPHICS_API_OPENGL_ES2 -o rshapes.o && \
    emcc -c rtextures.c -Os -DPLATFORM_WEB -DGRAPHICS_API_OPENGL_ES2 -o rtextures.o && \
    emcc -c rtext.c -Os -DPLATFORM_WEB -DGRAPHICS_API_OPENGL_ES2 -o rtext.o && \
    emcc -c rmodels.c -Os -DPLATFORM_WEB -DGRAPHICS_API_OPENGL_ES2 -o rmodels.o && \
    emcc -c raudio.c -Os -DPLATFORM_WEB -DGRAPHICS_API_OPENGL_ES2 -o raudio.o && \
    emcc -c utils.c -Os -DPLATFORM_WEB -DGRAPHICS_API_OPENGL_ES2 -o utils.o

# Archive into static library
RUN mkdir -p /opt/heapsight/lib /opt/heapsight/include && \
    emar rcs /opt/heapsight/lib/libraylib.a rcore.o rshapes.o rtextures.o rtext.o rmodels.o raudio.o utils.o && \
    cp raylib.h raymath.h rlgl.h /opt/heapsight/include/

# Pre-compile raylib header for faster student compilations
RUN cd /opt/heapsight/include && \
    em++ -x c++-header raylib.h -o raylib.h.pch \
    -DPLATFORM_WEB -DGRAPHICS_API_OPENGL_ES2 -O1 -std=c++17

# Create header directories for each learning path
RUN mkdir -p /opt/heapsight/headers/rpg/base \
    /opt/heapsight/headers/platformer/base \
    /opt/heapsight/headers/shooter/base \
    /opt/heapsight/headers/robotics/base

# Copy path-specific headers
COPY headers/ /opt/heapsight/headers/

# Enable ccache for all subsequent compilations (after raylib is built)
ENV EM_COMPILER_WRAPPER=ccache
ENV CCACHE_DIR=/opt/ccache
ENV CCACHE_MAXSIZE=5G

# Pre-warm ccache with warmup compilation
COPY warmup.cpp /tmp/warmup.cpp
RUN cd /tmp && \
    em++ warmup.cpp /opt/heapsight/lib/libraylib.a \
    -I/opt/heapsight/include \
    -O1 -DPLATFORM_WEB -sUSE_GLFW=3 -sASYNCIFY \
    -sALLOW_MEMORY_GROWTH=1 -sMODULARIZE=1 -sEXPORT_ES6=1 \
    -sGL_ENABLE_GET_PROC_ADDRESS \
    -o warmup.js -std=c++17 && \
    rm -f /tmp/warmup.*

# Install Node.js server dependencies
WORKDIR /opt/heapsight
COPY package.json /opt/heapsight/package.json
RUN npm install --production

# Copy server and compile script
COPY compile.sh /opt/heapsight/compile.sh
RUN chmod +x /opt/heapsight/compile.sh
COPY server.js /opt/heapsight/server.js

EXPOSE 8080
CMD ["node", "server.js"]
