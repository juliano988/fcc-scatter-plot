import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import * as d3 from "d3";
import styles from '../styles/Home.module.scss'
import { GraphicProps } from '../customInterfaces'
import tippy, { Instance, Props } from 'tippy.js';
import ReactDOMServer from 'react-dom/server';

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
        <div className={styles.graphicDiv}>
          <div className={styles.graphicClass}>
            <Graphic data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Graphic(props: GraphicProps): JSX.Element {

  const [forceRender, setForceRender] = useState<number>(Math.random())

  const graphicDivRef = useRef<HTMLDivElement>(null);

  const offset = 25;
  const topLabelWidth = 10;
  const leftLabelWidth = 45;
  const circlesRadius = 5;

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
      .attr('width', svgWidth + offset * 2 + leftLabelWidth)
      .attr('height', svgHeight + offset * 3 + topLabelWidth)
      .attr('transform', 'translate(' + -leftLabelWidth + ',' + -offset + ')')

    const xAxis = svg.append('g')
      .call(d3.axisTop(scaleX).tickFormat(d3.format(".0f"))
        .tickSize(-svgHeight)
        .tickPadding(5))
      .attr('transform', 'translate(' + (offset + leftLabelWidth) + ',' + (offset + topLabelWidth) + ')')
      .attr('stroke-dasharray', "2")
      .attr('stroke-opacity', 0.5)
      .attr('font-size', '1rem')

    svgWidth <= 600 && xAxis.selectAll('text').attr('transform', 'translate(15,' + (-topLabelWidth) + ') rotate(-45)')

    xAxis.select('path').remove()

    const yAxis = svg.append('g')
      .call(d3.axisLeft(d3.scaleTime().domain([minSecDate, maxSecDate]).range([circlesRadius, svgHeight - circlesRadius]))
        .tickFormat((d: Date) => d.getMinutes() + ':' + d.getSeconds().toString(10).padStart(2, '0') + 'min')
        .ticks(d3.timeSecond.every(30))
        .tickSize(-svgWidth)
        .tickPadding(5))
      .attr('transform', 'translate(' + (offset + leftLabelWidth) + ',' + offset + ')')
      .attr("stroke-dasharray", "2")
      .attr("stroke-opacity", 0.5)
      .attr('font-size', '1rem')
      .select('path').remove()

    const subtitle = svg.append('g')
      .attr('transform', 'translate(' + (leftLabelWidth + svgWidth - 210) + ',' + (svgHeight + offset + topLabelWidth * 2) + ')')

    subtitle.append('text')
      .style('font-size', '1rem')
      .attr('transform', 'translate(0,13)')
      .text('Riders with doping allegation')

    subtitle.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', 'orange')
      .style('stroke', 'black')
      .attr('transform', 'translate(210,0)')

    subtitle.append('text')
      .style('font-size', '1rem')
      .attr('transform', 'translate(50,33)')
      .text('No doping allegations')

    subtitle.append('rect')
      .attr('transform', 'translate(210,20)')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', 'blue')
      .style('stroke', 'black')

    const circles = svg.append('g')
      .attr('transform', 'translate(' + (offset + leftLabelWidth) + ',' + (offset + topLabelWidth) + ')')
      .selectAll('circle')
      .data(props.data).enter()
      .append('circle')
      .attr('fill', (d) => (d.Doping ? 'orange' : 'blue'))
      .attr('r', circlesRadius)
      .attr('cx', (d) => scaleX(d.Year))
      .attr('cy', (d) => scaleY(d.Seconds))

    const tippyInstanceArr: Array<Instance<Props>> = [];
    props.data.forEach(function (infos, i) {
      tippyInstanceArr.push(tippy((svg.selectAll('circle').nodes()[i] as SVGAElement), {
        allowHTML: true,
        placement: 'right-end',
        content: ReactDOMServer.renderToStaticMarkup(
          <div style={{ textAlign: 'left', fontSize: '1rem', backgroundColor: (infos.Doping ? 'hsla(40, 100%, 50%, 0.8)' : 'hsla(250, 100%, 50%, 0.8)'), maxWidth: '300px', padding: '3px', borderRadius: '3px' }}>
            <p style={{ margin: '0px' }}><strong>Name: </strong>{infos.Name}, {infos.Nationality}</p>
            <p style={{ margin: '0px' }}><strong>Placement: </strong>{infos.Place}º, {infos.Year}</p>
            <p style={{ margin: '0px' }}><strong>Time: </strong>{infos.Time}min</p>
            {infos.Doping && <p style={{ margin: '0px' }}>{infos.Doping}</p>}
          </div>
        )
      }));
    })

    return function () {
      svg.remove();
      tippyInstanceArr.map(function (elem) { return elem.unmount() })
    }
  }, [forceRender])

  useEffect(function () {
    function forceRenderFunc() {
      setForceRender(Math.random())
    }
    window.addEventListener('resize', forceRenderFunc)
    return function () {
      window.removeEventListener('resize', forceRenderFunc)
    }
  }, [])

  return (
    <div style={{width: '100%', height: '100%', padding: (offset + 10), paddingBottom: (offset + 35 + 10), paddingLeft: (leftLabelWidth + 5), color: 'black', backgroundColor: 'white' }}>
      <div ref={graphicDivRef} style={{width: '100%', height: '100%' }} />
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

