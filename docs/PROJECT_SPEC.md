# Football Scoreboard Builder — Project Spec

## Purpose
A client-side web tool for designing transparent football scoreboard frames for OBS overlays, live broadcast, and sports graphics.

## Core Principle
The exported PNG contains **only** the visual frame structure:
- No team names, no scores, no time, no placeholder text
- Operators add live data on top in OBS or other compositing software

## Target Users
- Broadcast operators
- Sports graphic designers
- OBS streamers / producers

## Constraints
- Local-only (no deploy, no backend, no auth)
- Client-side data processing only
- No external API calls
- LocalStorage for project persistence

## Output Formats
- PNG with transparent background (Fit Content)
- PNG 1920×1080 transparent canvas (Full HD)
- Scale options: 1×, 2×, 3×
- Project JSON (save/load workflow)
