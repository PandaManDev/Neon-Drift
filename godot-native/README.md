# Neon Drift — Native Windows Edition

This folder contains the first native Godot 4 project for Neon Drift. It is a real Godot game project, not the browser page packaged inside an application.

## Requirements
- Godot 4.3 or newer (Godot 4.x recommended)
- Windows 10 or Windows 11

## Run in Godot
1. Download or clone this repository.
2. In Godot Project Manager, choose **Import**.
3. Select `godot-native/project.godot`.
4. Open the project and press **F6** or **F5**.

## Controls
- **A / D** or **Left / Right**: steer
- **Space**: boost
- **Escape**: pause

## Current native build
The initial playable native arcade foundation includes procedural road rendering, steering, traffic obstacles, collision/game-over, boost energy, scoring, persistent local best score, pause and restart.

## Windows executable
Use Godot's **Project → Export** menu and install the Windows Desktop export template. Create a Windows Desktop preset and export `Neon Drift.exe`. The repository does not contain a compiled executable yet.

## Roadmap
This is the start of the native port. The existing web game's online friends, parties, Supabase accounts, full progression, operations center, cosmetics and achievements have not yet been ported. Those require native UI and backend integration work and are not represented as finished here.
