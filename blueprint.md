# Vampire Survivors Clone

## Overview

A 2D survival game inspired by the popular game "Vampire Survivors." The player controls a character who automatically attacks while the player focuses on moving to survive against hordes of enemies. The goal is to survive for a certain amount of time, collect experience, and upgrade weapons and abilities.

## Core Mechanics

*   **Player Control:** The player moves the character using WASD or arrow keys.
*   **Automatic Weapons:** The character's weapons fire automatically at set intervals.
*   **Enemies:** Hordes of enemies will spawn and move toward the player.
*   **Experience & Leveling:** Defeated enemies drop experience gems. Collecting them fills an experience bar, and leveling up allows the player to choose new weapons, passive upgrades, or improve existing ones.
*   **Survival:** The main objective is to survive for a set amount of time against increasingly difficult waves of enemies.

## Current Plan: Iteration 1 - The Foundation

*   **[COMPLETED]** **HTML Structure:** Replaced the existing HTML with a `<canvas>` element which will serve as the game's screen.
*   **[COMPLETED]** **CSS Styling:** Updated the CSS to ensure the canvas fills the screen and has a basic background.
*   **[COMPLETED]** **JavaScript Game Loop:**
    *   Created a main game loop that will run every frame.
    *   Implemented a player character.
    *   Added event listeners for keyboard input (W, A, S, D) to move the player.
    *   Drew the player on the canvas.

## Current Plan: Iteration 2 - Enemies

*   **[COMPLETED]** **Enemy Class:** Created an `Enemy` class with properties for position, size, color, and speed.
*   **[COMPLETED]** **Enemy Spawning:** Implemented a system to spawn enemies at random locations outside the canvas.
*   **[COMPLETED]** **Enemy Movement:** Enemies will move towards the player's current position.
*   **[COMPLETED]** **Collision Detection:** Implemented a simple collision detection between the player and enemies.

## Current Plan: Iteration 3 - Basic Weapon

*   **[IN PROGRESS]** **Projectile Class:** Create a `Projectile` class with properties for position, size, color, and speed.
*   **[IN PROGRESS]** **Automatic Firing:** The player will automatically fire projectiles at a set interval.
*   **[IN PROGRESS]** **Projectile Movement:** Projectiles will move towards the closest enemy.
*   **[IN PROGRESS]** **Collision Detection:** Implement collision detection between projectiles and enemies.
*   **[IN PROGRESS]** **Enemy Destruction:** When a projectile hits an enemy, the enemy will be destroyed.
