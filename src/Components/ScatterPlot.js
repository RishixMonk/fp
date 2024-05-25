import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useLocation } from 'react-router-dom';

const ScatterPlot = () => {
  const location = useLocation();
  const data = location.state?.data || [];
  const svgRef = useRef();

  useEffect(() => {
    if (data.length === 0) return; // Exit early if data is empty

    const formattedData = data.map((d, index) => ({
      id: index,
      lat: d.lat,
      lng: d.lng,
    }));

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const w = 800 - margin.left - margin.right;
    const h = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', w + margin.left + margin.right)
      .attr('height', h + margin.top + margin.bottom)
      .style('overflow', 'visible')
      .style('margin-top', '100px');

    // Clear previous content
    svg.selectAll('*').remove();

    const plotArea = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([12.91, 13.9])
      .range([0, w]);

    const yScale = d3.scaleLinear()
      .domain([74.9, 75.9])
      .range([h, 0]);

    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    plotArea.append('g')
      .attr('transform', `translate(0, ${h})`)
      .call(xAxis);

    plotArea.append('g')
      .call(yAxis);

    plotArea.selectAll('circle')
      .data(formattedData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.lng))
      .attr('cy', d => yScale(d.lat))
      .attr('r', 5)
      .attr('fill', 'blue');
  }, [data]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default ScatterPlot;
