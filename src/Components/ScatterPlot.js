import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useLocation } from 'react-router-dom';
import * as topojson from 'topojson';

const ScatterPlot = () => {
  const location = useLocation();
  const data = location.state?.data || [];
  const svgRef = useRef();
  let c = 0;

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Set up SVG dimensions
    const width = 800;
    const height = 600;
    svg.selectAll("*").remove();

    // Define projection
    const projection = d3.geoMercator()
      .scale(120)
      .translate([width / 2, height / 2]);

    // Append a group element to SVG
    const g = svg.append('g')
    // .append('feDropShadow')

  

    // Load world map data
    d3.json('https://raw.githubusercontent.com/d3/d3.github.com/master/world-110m.v1.json')
      .then((world) => {
        // Define path generator
        const path = d3.geoPath().projection(projection);

        // Draw world map
        g.selectAll('path')
          .data(topojson.feature(world, world.objects.countries).features)
          .enter().append('path')
          .attr('d', path)
          .attr('fill', '#ddd')
          .attr('stroke', '#666');
          alert("Zoom into the point to observe the difference. Yellow indicates a stoppage point");

        // Plot data points
        const points = g.selectAll('circle')
          .data(data)
          .enter().append('circle')
          .attr('cx', (d) => projection([d.longitude, d.latitude])[0])
          .attr('cy', (d) => projection([d.longitude, d.latitude])[1])
          .attr('r', 3)
          .attr('fill', (d) => {
            c++;
            if (d.stoppage === true) return 'yellow';
            else return (c % 2 === 0 ? 'blue' : 'red');
          })
          .attr('opacity', 0.7)
          .on('mouseover', (event, d) => {
            // Show coordinates information
            const [x, y] = projection([d.longitude, d.latitude]);
            svg.append('text')
              .attr('id', 'coordinates-info')
              .attr('x', x)
              .attr('y', y - 10)
              .text(`(${d.longitude}, ${d.latitude})`)
              .attr('text-anchor', 'middle')
              .attr('fill', 'black');
          })
          .on('mouseout', () => {
            // Remove coordinates information when mouse leaves the point
            svg.select('#coordinates-info').remove();
          });

        const zoom = d3.zoom()
          .scaleExtent([1, 10000]) // Limit zoom scale
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
          });

        // Apply zoom behavior to SVG
        svg.call(zoom);
      });

  }, [data]);

  return (
    <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '10px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
      <svg ref={svgRef} width={800} height={600} style={{ display: 'block', margin: 'auto',boxShadow: '0px 0px 10px rgba(106, 90, 205, 5.1)'
}}></svg>
<br></br>
      <p style={{ textAlign: 'center', color: 'Black' ,backgroundColor:d3.rgb(255, 99, 71, 0.8)}}>Zoom into the point to observe the difference. Yellow indicates a stoppage point.</p>
    </div>
  );
};


export default ScatterPlot;
