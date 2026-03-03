# Leveling App - Major Overhaul TODO

## Dashboard Changes
- [ ] Remove ALL dummy/seed data — app starts completely empty
- [ ] Hunter Stats values must reflect actual quest-based activity only
- [ ] Daily Quests section: no pre-planned entries, completely empty until user adds
- [ ] Recent Logs: show logs of daily quests completions, rankings, XP changes
- [ ] System Feed: show all system log events, 10 entries at a time, link to dedicated log page
- [ ] System Feed dedicated page: logs stacked by date/time in order

## Activity Log Page (Complete Redesign)
- [ ] Remove Quick Log section entirely
- [ ] Redesign from scratch — optimized around quest completion tracking
- [ ] History shows quest-related activity only
- [ ] Clean, optimized UI

## Quests Page
- [ ] Remove all pre-set/default quests — starts empty
- [ ] User creates all quests with full customization
- [ ] Fix "New Quest" creation — add confirm/create button (currently broken)
- [ ] Add more general emojis for activity types
- [ ] Add "Set Demon Level" difficulty selector with 6 generated demon images
- [ ] Demon levels correspond to difficulty of quest

## Stats Page
- [ ] Detailed Stats: values based on actual quests set up
- [ ] AI summary of quests data
- [ ] Monthly analysis section with all quest reports for the month
- [ ] Keep radar chart and XP over time

## UI/Transitions
- [ ] Add page transitions (sword cutting demon animation or similar)
- [ ] Polish overall aesthetic

## Game Mechanics
- [ ] Quest completion gives XP
- [ ] Incomplete quests decrease XP and can lower rank
- [ ] All values start at zero — no dummy data

## v3 Changes
- [ ] Add email login system with Manus OAuth
- [ ] Remove all preset demo values everywhere
- [ ] Fix Create Quest button accessibility at bottom
- [ ] Change frequency to day picker (select any day)
- [ ] Make demon level images clearly visible
- [ ] Push DB schema and sync

## v3.1 Fixes
- [x] Fix Create Quest button hidden behind bottom nav - add padding/margin
- [x] Add daily quest auto-reset: completed quests reappear next day automatically

## v3.2 Fixes
- [x] Replace handleComplete with quest respawn logic - completed daily/custom quests auto-create next occurrence
