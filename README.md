# Planet and Satellite Visualization

## Project Overview

This project was developed as part of the Information Visualization course during the second semester of 2022 at Pontificia Universidad Católica de Chile. Using the D3.js library, the project provides interactive visualizations of the solar system, displaying the planets and their satellites.

## Objectives

The main objectives of this project are:

- To visualize the planets in the solar system using both logarithmic and linear scales to represent distances and sizes, respectively.
- To allow users to interact with the visualizations by hovering and clicking on planets and satellites, highlighting relevant information and categories.
- To filter and organize satellite data based on user-defined criteria, offering an intuitive exploration of planetary satellites.

## Data Source

The data used for these visualizations was extracted from [Devstronomy](https://devstronomy.com).

## Visualizations

### Visualization 1: Planets of the Solar System

- The first visualization displays the Sun and the planets in our solar system, positioned according to a logarithmic distance scale and represented by a linear size scale.
- Colors reflect the average temperature of each planet.
- **Interactions**:
  - Hovering over a planet reveals detailed information.
  - Clicking on a planet highlights other planets that either take less or more than 26 years to orbit the Sun. The corresponding satellites of these planets are also shown in the second visualization.

### Visualization 2: Satellite Visualization

- The second visualization focuses on the satellites of the planets selected from the first visualization.
- Users can filter satellites by radius and sort them by name or albedo (reflectivity).
- **Interactions**:
  - Hovering over a satellite displays its information and highlights the satellite by lowering the opacity of the others.
  - Satellite arms represent albedo, while the head size of the satellite icons indicates the size of the satellite.

## How to Run

1. Clone this repository:

   ```bash
   git clone <repository-url>
    cd <repository-name>
    ```

2. Open `index.html` in your browser or use a local HTTP server:

    ```bash
    python3 -m http.server
    ```

    Then, open `http://ip:port` in your browser.

## Interactions and Filtering

- In the first visualization, clicking on a planet filters based on its orbital category (less or more than 26 years).
- In the second visualization, you can filter satellites based on size and sort them by name or albedo using buttons.
- The visualizations are interactive, allowing users to hover and explore detailed information for planets and satellites.
