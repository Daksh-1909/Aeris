# M10 SunCalc spot check

Checked the planner’s SunCalc sunrise and sunset output against NOAA/GML’s 2026 sunrise/sunset tables for **5 October 2026**. Both samples are inside NOAA’s stated ±1 minute range for these latitudes.

| Place | Coordinates | Event | SunCalc | NOAA/GML |
|---|---:|---|---:|---:|
| St. Louis, Missouri | 38.62, -90.18 | Sunrise | 07:00 CDT | 07:00 CDT |
| St. Louis, Missouri | 38.62, -90.18 | Sunset | 18:37 CDT | 18:37 CDT |
| Denver, Colorado | 39.74, -104.99 | Sunrise | 07:00 MDT | 07:00 MDT |
| Denver, Colorado | 39.74, -104.99 | Sunset | 18:35 MDT | 18:36 MDT |

The one-minute sunset difference for Denver is within the published tolerance. NOAA notes its calculator is no longer actively maintained, so this is a cross-check rather than a guarantee of observed conditions. SunCalc computes astronomical times locally and makes no forecast request.

Sources: [NOAA/GML St. Louis table](https://gml.noaa.gov/grad/solcalc/table.php?lat=38.62&lon=-90.18&year=2026), [NOAA/GML Denver table](https://gml.noaa.gov/grad/solcalc/table.php?lat=39.74&lon=-104.99&year=2026), [NOAA calculation details and accuracy](https://gml.noaa.gov/grad/solcalc/calcdetails.html).
