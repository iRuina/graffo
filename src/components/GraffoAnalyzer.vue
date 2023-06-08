<template>
  <div>
    <h1>Hi, I'm a graph analyzer</h1>
    <input type="file" @change="handleFileChange" accept=".xlsx">
    <div id="graph-container"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import * as XLSX from 'xlsx';

export default {
  name: "GraffoAnalyzer",
  data(){
    return{
      graphData:{},
    }
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

        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const firstColumn = [];
        const secondColumn = [];

        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellAddressFirst = XLSX.utils.encode_cell({ r: row, c: 1 });
          const cellAddressSecond = XLSX.utils.encode_cell({ r: row, c: 2 });

          const cellFirst = worksheet[cellAddressFirst];
          const cellSecond = worksheet[cellAddressSecond];

          if (cellFirst && cellFirst.v) {
            firstColumn.push(cellFirst.v);
          }

          if (cellSecond && cellSecond.v) {
            secondColumn.push(cellSecond.v);
          }
        }

        this.graphData = {
          nodes: firstColumn,
          links: secondColumn,
        };

      };
      reader.readAsArrayBuffer(file);
    },
  },
};
</script>
