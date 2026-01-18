import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function MiniChart({analysis=[]}){
  // group by day for login counts
  const counts = {}
  analysis.forEach(a => {
    const day = new Date(a.time).toLocaleDateString()
    counts[day] = (counts[day] || 0) + 1
  })
  const labels = Object.keys(counts).slice(-7)
  const data = {
    labels,
    datasets: [{label:'Events',data:labels.map(l=>counts[l]),fill:false,borderColor:'#7b4bff',tension:0.3}]
  }

  return (
    <div style={{width:180,height:60}}>
      <Line data={data} options={{plugins:{legend:{display:false}},maintainAspectRatio:false,scales:{x:{display:false},y:{display:false}}}} />
    </div>
  )
}
