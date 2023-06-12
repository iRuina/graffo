<template>
  <div>
    <h1>Hola , soy un analizador de graffos</h1>
    <input type="file" @change="handleFileChange" accept=".xlsx" />
    <div id="graph-container" class="mt-10">
      <svg id="graph-svg" :width="width" :height="height">
        <g class="graph"></g>
      </svg>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import * as XLSX from "xlsx";

export default {
  name: "GraffoAnalyzer",
  data() {
    return {
      graphData: [],
      width: 0,
      height: 0,
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        const graphData = [];

        graphData.push(
          {
            clave: "no tiene relacion",
            valor: [],
          },
          {
            clave: "pcmens-app-camerfirma-client",
            valor: [],
          },
          {
            clave: "pcmens-commons-manager",
            valor: [],
          }
        );

        for (let row = range.s.r + 2; row <= range.e.r; row++) {
          // "+1" Para omitir la primera fila
          const cellAddressFirst = XLSX.utils.encode_cell({ r: row, c: 1 });
          const cellAddressSecond = XLSX.utils.encode_cell({ r: row, c: 2 });

          const cellFirst = worksheet[cellAddressFirst];
          const cellSecond = worksheet[cellAddressSecond];

          if (cellFirst && cellFirst.v) {
            const obj = {
              clave: cellFirst.v,
              valor: null,
            };
            if (cellSecond && cellSecond.v) {
              if (cellSecond.v === "x") {
                cellSecond.v = ["no tiene relacion"];
                obj.valor = cellSecond.v;
              } else {
                obj.valor = cellSecond.v.split("\n");
                if (obj.valor.length - 1 === " ") {
                  obj.valor.pop();
                  console.log("Eliminado espacio vacio de " + cellFirst.v);
                }
              }
            }
            graphData.push(obj);
          }
        }
        this.graphData = graphData;
        console.log(JSON.stringify(this.graphData));
        this.renderGraph(); // Renderizar el grafo después de procesar los datos
      };

      reader.readAsArrayBuffer(file);
    },
    renderGraph() {
      if (!this.graphData) {
        return; // Salir si this.graphData no tiene un valor válido
      }
      // Obtén una referencia al contenedor del gráfico y al elemento SVG
      const graphContainer = d3.select("#graph-container");
      const svg = d3.select("#graph-svg");

      // Define las dimensiones del SVG y el margen
      const width = +graphContainer.style("width").replace("px", "");
      const height = +graphContainer.style("height").replace("px", "");
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Crea una escala de colores para asignar colores a los módulos
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      // Crea una simulación de fuerza para posicionar los nodos del grafo
      const simulation = d3
        .forceSimulation()
        .force(
          "link",
          d3.forceLink().id((d) => d.clave)
        )
        .force("charge", d3.forceManyBody().strength(-900))
        .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
        .force("collide", d3.forceCollide().radius(50));

      // Crea los enlaces entre los nodos
      const links = this.graphData.flatMap((d) =>
        d.valor.map((v) => ({ source: d.clave, target: v }))
      );

      // Crea los nodos del grafo
      const nodes = this.graphData.map((d) => ({ clave: d.clave }));

      // Asigna colores a los nodos según el módulo
      nodes.forEach((node, index) => {
        node.color = colorScale(index);
      });

      // Crea el elemento g.graph para contener los nodos y enlaces
      const graph = svg.append("g").attr("class", "graph");

      // Crea los elementos SVG para representar los enlaces y los nodos
      const linkSelection = graph
        .selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6);

      const nodeSelection = graph
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", 16)
        .attr("fill", (d) => d.color)
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

      const labelSelection = graph
        .selectAll(".label")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .text((d) => d.clave)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#333")
        .attr("font-size", "12px")
        .call((text) =>
          text
            .attr("x", 0)
            .attr("y", 0)
            .each(function () {
              const bbox = this.getBBox();
              const padding = 2;
              d3.select(this)
                .attr("x", -bbox.width / 2 - padding)
                .attr("y", -bbox.height / 2 - padding);
            })
        );

      // Define la función tick para actualizar la posición de los elementos en cada tick de la simulación
      const tick = () => {
        linkSelection
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        nodeSelection.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        labelSelection.attr("x", (d) => d.x).attr("y", (d) => d.y);
      };

      // Actualiza la simulación con los nodos y enlaces
      simulation.nodes(nodes).on("tick", tick);
      simulation.force("link").links(links);

      // Ajusta el tamaño del SVG al contenedor
      svg.attr("width", width).attr("height", height);

      // Funciones de arrastre de nodos
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    },
  },
};
</script>

<style scoped>
#graph-container {
  width: 100% !important;
  height: 1200px !important;
}
</style>