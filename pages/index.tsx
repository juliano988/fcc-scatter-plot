import Head from 'next/head'
import { useEffect, useRef } from 'react'
import * as d3 from "d3";
import styles from '../styles/Home.module.css'
import { GraphicProps } from '../customInterfaces'
import { ticks } from 'd3';

export default function Home({ data }): JSX.Element {
  return (
    <div className={styles.container}>
      <Head>
        <title>FCC - Scatterplot Graph</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>Doping in Professional Bicycle Racing</h1>
        <h3>35 Fastest times up Alpe d'Huez</h3>
        <Graphic data={data} width='60vw' height='60vh' />
      </div>
    </div>
  )
}

function Graphic(props: GraphicProps): JSX.Element {

  const graphicDivRef = useRef<HTMLDivElement>(null);

  const offset = 35
  const circlesRadius = 5

  useEffect(function () {

    const svgWidth = graphicDivRef.current.clientWidth
    const svgHeight = graphicDivRef.current.clientHeight;

    const minX = Math.min(...props.data.map(function (arg) { return arg.Year }))
    const maxX = Math.max(...props.data.map(function (arg) { return arg.Year }))
    const minY = Math.min(...props.data.map(function (arg) { return arg.Seconds }))
    const maxY = Math.max(...props.data.map(function (arg) { return arg.Seconds }))

    const minSecDate = new Date(null, null, null, null, null, d3.min(props.data.map(function (arg) { return arg.Seconds })))
    const maxSecDate = new Date(null, null, null, null, null, d3.max(props.data.map(function (arg) { return arg.Seconds })))

    const scaleX = d3.scaleLinear().domain([minX, maxX]).range([circlesRadius, svgWidth - circlesRadius])
    const scaleY = d3.scaleLinear().domain([minY, maxY]).range([circlesRadius, svgHeight - circlesRadius])

    const svg = d3.select(graphicDivRef.current)
      .append('svg')
      .attr('width', svgWidth + offset * 2)
      .attr('height', svgHeight + offset * 2)

    const xAxis = svg.append('g')
      .call(d3.axisTop(scaleX).tickFormat(d3.format(".0f"))
        .tickSize(-svgHeight)
        .tickPadding(10))
      .attr('transform', 'translate(' + offset + ',' + offset + ')')
      .attr("stroke-dasharray", "2")
      .attr("stroke-opacity", 0.5)
      .select('path').remove()

    let teste = [...props.data.map(function (val) { return val.Time.replace(':', '') })]
    console.log(teste)

    const yAxis = svg.append('g')
      .call(d3.axisLeft(d3.scaleTime().domain([minSecDate, maxSecDate]).range([circlesRadius, svgHeight - circlesRadius]))
        .tickFormat((d: Date) => d.getMinutes() + ':' + d.getSeconds().toString(10).padStart(2, '0'))
        .ticks(d3.timeSecond.every(30))
        .tickSize(-svgWidth)
        .tickPadding(10))
      .attr('transform', 'translate(' + offset + ',' + offset + ')')
      .attr("stroke-dasharray", "2")
      .attr("stroke-opacity", 0.5)
      .select('path').remove()

    console.log(minSecDate.getMinutes())

    const circles = svg.append('g')
      .attr('transform', 'translate(' + offset + ',' + offset + ')')
      .selectAll('circle')
      .data(props.data).enter()
      .append('circle')
      .attr('fill', (d) => (d.Doping ? 'orange' : 'blue'))
      .attr('r', circlesRadius)
      .attr('cx', (d) => scaleX(d.Year))
      .attr('cy', (d) => scaleY(d.Seconds))

    console.log(props.data)
  }, [])

  return (
    <div style={{ padding: offset }}>
      <div ref={graphicDivRef} style={{ width: props.width, height: props.height, margin: 'auto' }} />
    </div>
  )
}

export async function getStaticProps(context) {
  const res = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
  const data = await res.json();
  return {
    props: { data } // will be passed to the page component as props
  }
}

