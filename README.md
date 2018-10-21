# SolarStatus-Gear

![App on watch](https://i.imgur.com/IDzvNDd.png)

This is an energy status display for the Samsung Galaxy Watch or similar Tizen devices.
The data is fetched from a Raspberry Pi or Beaglebone or any http web server for that matter. Getting the data into the relevant files is done elsewhere, this is just a display. There's one file for the core values, and then two text files for the histogram data for PV energy production and domestic power usage.

Data is refreshed every 20 seconds and the current screen is automatically updated. No extra libraries have been used.

A black/white e-ink version without animations, as well as one for the M5Stack hardware can be found on my github as well.

